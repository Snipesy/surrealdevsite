---
title: "Rooting the Cadillac Part 2: SecOc"
date: 2026-09-22T09:09:26.000Z
updated: 2026-10-06T01:19:22.000Z
categories: ["automotive-ramblings"]
excerpt: "Several months ago I mentioned much of Global B is neither encrypted nor signed. This is 'mostly' true, especially on CAN5, but its not as bad as you think. Since our goal is actually being able to repair the vehicle we own, being able to actually place a module on the vehicle that can cooperate..."
cover: "/images/fca9ea1f22f1.svg"
---

Several months ago I mentioned much of Global B is [neither encrypted](/the-abcs-of-global-b/) _nor signed._ This is 'mostly' true, especially on CAN5, but its not as bad as you think. Since our goal is actually being able to repair the vehicle we own, being able to actually place a module on the vehicle that can cooperate is a pretty important hurdle to overcome. The quick TLDR is OEMs have made this insanely difficult... While they disguise these mechanisms as security in reality they just hurt aftermarket repair and basically make any vehicle unrepairable the second they stop making parts. Its many times hard to get new parts on a vehicle that just rolled off the line. Anyway no matter. I can break anything. Let's talk about SecOc. I hope you like math.

## CAN Security (SecOc)

The Lyriq, CT5, and all of GM's global B vehicles use a large number of CAN busses and a little bit of Ethernet. All the CAN busses, usually (but not always) meet at the Central Gateway module. The gateway will selectively forward traffic from one bus to another (i.e. CAN5 to CAN2). Sometimes it combines multiple frames into one. Sometimes it checks for a MAC sometimes it doesn't. **It depends.** But, pretty much all critical vehicle controls will be over CAN or CAN-FD. The exact protocol varies but they are generally one of...

-   500kbit Classic 11/29bit CAN (CAN5 is a notable example)
-   500kbit / 2Mbit FD
-   500kbit / 5Mbit FD

Some frames on CAN will have an MAC. For example a common frame across all frames is the central gateway status and power frame, 0x370. You will notice some data changing across every frame.

| Power mode | Frame | bit37:3 |
| --- | --- | --- |
| Off | `370#E8EE8A693810` | 1 |
| Accessory | `370#68A66F495810` | 2 |
| Run | `370#7C8CB0697810` | 3 |
| Crank | `370#69F659499810` | 4 |
| Propulsion | `370#6BFE8B49B810` | 5 |

These frames contain a MAC (message authentication code) used to authenticate the message/payload. These are SecOc authenticated messages, but they are not encrypted. Anyone is free to parse the messages, and in fact many modules on the bus will process the message even if the auth fails.

### SecOC Algoirithim

Each participating module will share a key which is used to both generate the MAC and check its validity. The math (and actual key) is shown below.

<div style="font-family: ui-monospace,SFMono-Regular,'JetBrains Mono',Menlo,Consolas,monospace; text-decoration: none; margin: 32px 0;"><div style="background: #f7f8f7; border: 1px solid #e3e6e4; border-radius: 10px; padding: 20px 24px; font-size: 15px; line-height: 1.6; color: #1a1a1a; overflow-x: auto; text-decoration: none;">MAC = CMAC_AES128<span style="color: #4a6fa5;">_k</span>( data_id(u8) ‖ BE32(can_id) ‖ BE64(freshness) ‖ payload )</div><pre class="annotated"><span class="note">input     </span>01  00000370  000000005FEEE249  3810
<span style="color: #a8b0aa;">          ^id ^can_id   ^freshness        ^payload</span>
<span class="note">key       </span>0814586a72522fd9b57685de676eb246
&#8203;
<span class="note">CMAC      </span>e8ee8a78 b7ba268d 25473fb3 5bf2067c
<span class="note">trunc 27  </span><strong style="color: #0f7a4a;">E8EE8A | 011</strong>
<span class="note">wire      </span><strong style="color: #0f7a4a;">E8EE8A | 011</strong></pre></div>

The exact padding and payload location may vary, and freshness is many times combined with a secondary companion ID.

### SecOC Provisioning

SecOC keys are provisioned in the car against the OEM's servers. It is possible they may be re provisioned several times. When a vehicle is re provisioned (such as a replacement module) then all modules sharing the key must be updated. These keys get provisioned over UDS. The actual provisioned key seen on the wire is encrypted against a key placed in the device at the factory. We will call this the **factory key**. To initiate the provision you must also be in possession of 3 things. 1. The key used to unlock the ECU ($27), which is unique for every module. 2. The ID of the HSM or other identifier source, which is generally provisioned at factory. 3. A master key, which is provisioned at factory or assembly line.

#### $27 Access

The first step of provisioning is actually being in the correct state which will almost always require $27 security access over UDS. This will allow you to initiate the UDS diagnostic routine to then provision the actual key.

<pre class="annotated">$27 01                          <span class="note">requestSeed, level 1</span>
  -&gt; 67 01 &lt;31-byte seed&gt;       <span class="note">seed = ecuid(16B) ‖ nonce(15B)</span>

$27 02 &lt;12-byte key&gt;            <span class="note">sendKey, level 1</span>
  -&gt; 67 02                       <span class="note">accepted</span>
  -&gt; 7F 27 35                    <span class="note">NRC 0x35, invalidKey</span></pre>

<pre class="annotated">K1  = CMAC-AES128( root_key, subfn(1B) ‖ ecuid(16B) ‖ nonce(15B) )
key = CMAC-AES128( K1, 0xFF ×16 )[0:12]</pre>

##### Fully worked example

<pre class="annotated"><span class="note">Inputs</span>

root_key  2b7e151628aed2a6abf7158809cf4f3c    <span class="note">AES-128 test key</span>
subfn     01
ecuId   0102030405060708090a0b0c0d0e0f10    <span class="note">illustrative</span>
nonce     112233445566778899aabbccddeeff      <span class="note">illustrative, module-generated</span>

<span class="note">Step 1: the seed, i.e. what $27 01 returns on the wire (31B)</span>
seed = ecuId ‖ nonce
     = 0102030405060708090a0b0c0d0e0f10112233445566778899aabbccddeeff

<span class="note">Step 2: first CMAC input (32B)</span>
msg1 = subfn ‖ seed
     = 010102030405060708090a0b0c0d0e0f10112233445566778899aabbccddeeff

K1   = CMAC_root_key(msg1)
     = 344944c7c7a8e103f1c9703cca19bf52

<span class="note">Step 3: second CMAC, over a block of 0xFF</span>

msg2     = ffffffffffffffffffffffffffffffff
full_tag = CMAC_K1(msg2)
         = ad3ccd21e367a121640b2a233ec7482a

<span class="note">Step 4: truncate to 12 bytes; this is the $27 02 payload</span>
key_response = full_tag[0:12]
             = <strong style="color: #0f7a4a;">ad3ccd21e367a121640b2a23</strong></pre>

Wire trace with those numbers:

<pre class="annotated">$27 01
  -&gt; 67 01 0102030405060708090a0b0c0d0e0f10112233445566778899aabbccddeeff

$27 02 ad3ccd21e367a121640b2a23
  -&gt; 67 02                        <span class="ok">accepted</span></pre>

#### SecOc Provision

Once 27 access is achieved you can begin the UDS Diagnostic Routine to provision the new key. What that routine is (i.e. its RID) and what it looks like will vary module to module, but the general algo is the same.

<pre class="annotated"><span class="note">Inputs</span>

auth_key  00112233445566778899AABBCCDDEEFF     <span class="note">authorizing key, typically slot 1,0, or some efuse state</span>
new_key   FEDCBA9876543210FEDCBA9876543210     <span class="note">key being installed into the target</span>
UID       000102030405060708090A0B0C0D0E0F0102 <span class="note">120-bit HSM unique ID</span>
ID        5                                    <span class="note">target slot, 4 bits</span>
AuthID    1                                    <span class="note">authorizing slot, 4 bits</span>
counter   0x0000001                            <span class="note">28-bit anti-replay counter;</span>
flags     0000</pre>

<pre class="annotated"><strong style="color: #0f7a4a;">Step 1: derive K1, K2 from auth_key</strong>  <span class="note">(SHE KDF = Matyas-Meyer-Oseas over AES-128)</span>

KDF(key, const) = AES_Encrypt(key, const) XOR const

K1 = KDF(auth_key, KEY_UPDATE_ENC_C)
K2 = KDF(auth_key, KEY_UPDATE_MAC_C)

KEY_UPDATE_ENC_C = 0x01015348450080000000000000000B0
KEY_UPDATE_MAC_C = 0x01025348450080000000000000000B0

<strong style="color: #0f7a4a;">Step 2: build M1</strong>  <span class="note">(16 bytes)</span>

M1 = UID(120b) ‖ ID(4b) ‖ AuthID(4b)

<strong style="color: #0f7a4a;">Step 3: build M2</strong>  <span class="note">(32 bytes)</span>

plaintext = counter(28b) ‖ flags(4b) ‖ new_key(128b)      <span class="note">20 bytes</span>
M2        = AES-128-CBC_Encrypt(K1, IV=0x0, plaintext)

<strong style="color: #0f7a4a;">Step 4: build M3</strong>  <span class="note">(16 bytes)</span>

M3 = CMAC-AES-128(K2, M1 ‖ M2)

<strong style="color: #0f7a4a;">Step 5</strong>

M1 | M2 | M3 = 64 bytes total</pre>

This output is then sent to the target ECU, the math is reversed to derive **new\_key** and the resulting value is loaded into the HSM.

<pre class="annotated">31 01 02 00 &lt;slot:1B&gt; &lt;M1:16B&gt; &lt;M2:32B&gt; &lt;M3:16B&gt;
<span class="note">^^ ^^ ^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
|  |  |     the 65-byte option record (param_4 == 0x41)
|  |  RID, big-endian
|  subfunction 01 = startRoutine
routineControl</span>

<span class="note">response</span>  71 01 02 00 &lt;status&gt;</pre>

The above system would need to be replicated for any aftermarket repair. The OEMs are the only ones who actually have the secret keys on their servers, and they dont have a path to provision aftermarket ones. Given they would prefer selling used vehicles or pushing people toward dealerships for repair, this is a conflict of interest.

## Ethernet Security

Ethernet is a singular network subdivided using vlans.

<figure><img src="/images/8b1d109d92ae.svg" alt="Network diagram: the CGM gateway switch links the radio, telematics and SuperCruise IPM, each with VLAN 4/5/203 IPs; telematics reaches the internet" width="720" height="821" loading="lazy"></figure>

The entire vehicle's CAN network is sent over VLAN 502 as a UDP multicast message, so the easiest way to monitor an entire global b vehicle is interestingly. A pcap. Some switches will block vlan traffic but much of its open. In ours this was sourced from 172.16.50.207->239.192.0.9 (multicast) on port 59200.

```text
element header (7B):
  type        1B              0x02 = CAN/CAN-FD frame
  body_length 2B  big-endian
  element_id  4B  little-endian   the CAN ID

type-0x02 body (16 + data_len bytes):
  extended    1B   0 = standard 11-bit, 1 = extended 29-bit
  dlc         1B   CAN DLC code (0-8 classic, 9-15 -> 12..64 FD)
  actual_len  1B   data length in bytes, must match DLEN[dlc]
  metadata[5]:
    [0] controller (mirror, must equal [2])
    [1] FD marker byte (bit 0x30 set -> CAN-FD record)
    [2] controller  <- authoritative channel (fca0..fca9)
    [3] flags       (0x01, 0x09 dominant; 0x04/0x0A/0x0B rare)
    [4] unused/reserved
  rolling[4]  4B    (timestamp-like counter, endian TBD)
  data[actual_len]  the CAN payload bytes
  trailer[4]  4B    = rolling, byte-reversed (integrity check)
```

On at least the vehicles I looked at, there was no authentication of any form on the in vehicle Ethernet. At least, not at the layer 2 or layer 3 level i.e. IpSec or MacSec. Some niche scenarios do use TLS, but so does watching YouTube on the car, so that's not really note worthy.

## Breaking SecOc

Mathematically it's not possible (anytime soon). But the world is messy. 0814586a72522fd9b57685de676eb246 is a real secoc key. From a real car... Well its totaled, but it was real at one point. Taken with zero days which will just be patched at some point.... I will publish them, But not today. Regardless I think its possible that all SecOc keys can be dumped. From any module. From any truck or car. No exploits required. You just need to think fast. Really fast.

---
title: "The ABCs of Global B"
date: 2026-06-16T23:37:32.000Z
updated: 2026-10-15T22:21:28.000Z
categories: ["automotive-ramblings"]
excerpt: "At Surreal Development we created Gretio for Global B (successfully) with 0 prior knowledge. The only information you can find about Global B on the internet is conjecture but nothing definitive. We want to change that, and so we are pleased to create what might be the first definitive 100% public..."
cover: "/images/af6848626d16.png"
---

At Surreal Development we created Gretio for Global B (successfully) with 0 prior knowledge. The only information you can find about Global B on the internet is conjecture but nothing definitive. We want to change that, and so we are pleased to create what might be the first definitive 100% public documentation on Global B. What it is, why it came to be, and if it is even secure or not. Most importantly we want to know its impact on right to repair and diagnostic tools (like Gretio!)

Global B. Previously known as Ultifi or the VIP Architecture... Is GM's newer architecture made to replace the existing Global A system. Since 2023 it is the standard architecture on all GM Vehicles (Cadillac, GMC, Sierra, etc...).

## GM's Troubled Past with Global A Theft

<iframe loading="lazy" title="Police explain thieves&amp;apos; new methods to steal newer vehicles" src="https://www.youtube-nocookie.com/embed/11rD_bpcC5U?feature=oembed" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>

A critical flaw of GM's global a system was that most of the security was built into the BCM, or Body Control Module. The BCM is what authenticated against your key fob (or transponder in the actual keyed ignition).

If one loses all keys to their truck, then the technician must perform what is called a "90 minute relearn" which will allow new keys to be learned and the vehicle to be driven once again. The 90 minutes was in theory enough time for someone to notice a thief attempting this.

So how is it done in less time? The BCM is the central truth of Global A. It is located on the driver side footwell, so any exploit (or even just outright replacing the BCM) can cause the vehicle to be driven away instantly. While there is a pairing process to the ECM in practice it is not trustworthy and can be bypassed in milliseconds. In fact most global a vehicles can be completely unlocked with a simple 2 or 5 byte seed/key challenge response.

Was GM's approach bad? Not necessarily. GM was just targeted because large trucks (Silverado and Sierra) in particular are high value. These exploits are nothing compared to Kia. Regardless, GM has become somewhat paranoid and that paranoia is what shaped Global B.

## The KGB of Global B

![Alan Williams as KGB First Deputy Chairman Charkov in HBO's Chernobyl, subtitled "The KGB is a circle of accountability"](/images/92f395915345.png)

The core of global b is a circle of accountability. Every module does a handshake with the central gateway module (CGM, or SGM, or SDGM). If a critical module fails the entire system fails and the vehicle will not start.

GM has an api service which for some weird internal cultural reason they call the "back office". It's all hosted on Azure at least for their NA servers. These servers contain the certificates used to sign almost everything on Global B, and is also used to provision secrets directly to models. Each control module has a hard coded CA somewhere in the module so that the system only works with GM, and because the private keys are held only on GM's servers... It's impossible for the vehicle to provision its own. This system is shared across everything in some capacity from the android head unit to the Engine Control Module.

One of those secrets is used to authenticate every single module when the vehicle first starts.

![Sequence diagram: GM back office provisions a per-module key via the SDGM, then each module must pass a MAC challenge or the vehicle won't start](/images/3b7c6bb7a349.png)

Every significant module does this. Which on some GM vehicles is over 30 control modules. This system (combined with the physical key transponder) makes up the anti theft system of Global B. If a critical module is swapped out, the vehicle simply refuses to start.

When a module is replaced 'properly' the GM tech has to perform what GM calls a "Serial Data Authentication Configuration" (**SDAC**) procedure which provisions the systems using GM's back office service on an ad hoc manner. Not doing so means a no start and the illusive U1962 DTC.

Contrary to what you may read online this system does not rely on encrypted CAN or anything like that. In fact much of the traffic in global b is neither encrypted nor signed.

### $27 Access

$27 security access allows a tester to authenticate against the SDGM for privileged actions. Notably this is usually done against the SDGM and not the module directly like it was in Global A.

The tester retrieves a seed from the SDGM (which will change every time its requested). The tester then needs to authenticate against GM's servers using their own credentials (i.e. SPS2/3). GM then responds with the key and the action can continue (programming or whatnot).

Most 'cool' actions (like writing DIDs, programming, etc...) are all blocked by $27. Meaning a random third party tester simply cannot access those features.

What happens if you doctor the SDGM? Great question, but its probably not going to be easy. Even if you do get into the SDGM every single module is only going to boot off a GM signed file anyway so you wouldn't gain as much access as you think.

In addition, certain actions have secondary $27 blockers.... Most notably key reprogramming. These secondary blockers use a completely different key on GM's server, so simply getting into the SDGM (which tbh isn't that hard to do) doesn't give you privileged access to the entire vehicle.

_So if GM goes defunct it will be impossible to learn a simple key fob..... Yeah._

#### So how does Gretio still work without $27?

Honestly I've been asking myself that as well. GM's systems are not very right to repair friendly and they just make my life harder.

I believe GM did not want to share their internal secrets with people such as Autel, SnapOn, Mitchell, etc.... And so they kept enough of their system open without needing to authenticate with the SDGM. So certain diagnostic functions just don't need to authenticate with GM, and thus Gretio is allowed to operate on Global B without auth at all.

This is a different approach from i.e. Stellantis who requires gateway authentication for basically everything.

## Android

Now let's talk android. Android plays an important rule in how OTAs are performed on Global B, and so understanding how it plays is important to understanding Global B as whole.

GM took a very untrusted stance on their AAOS integration... Android is what is known as a "Guest OS" on Global B. On our 2023 Chevy Colorado, Android is simply a VM running within some green hills software that's frankly more similar to the global a radios than global b.

This means if you broke into Android, you can't escape the container.

And even if you did escape the container, you can't escape the isolated subnet you are on which is composed of just you, the SDGM, and the telematics (OnStar) module.... So no one is going to be remotely causing a car to crash any time soon. Regardless it's cool to think about 'how' this is all managed especially since its where things like **OTA** comes from.

First off the headunit is known as the **Center Stack Module** or **CSM.** The gateway is called the **SDGM** or **CGM** depending where you look (GM can never settle on a single name can they).

### Side Loading

#### Traditional Side Loading

Won't work, GM disables the underlying permission in android to allow apps to install things. I'll talk about this more when we discuss ADB.

On some versions it 'did' work which is interesting. So maybe you should decline those OTAs.

#### The Weird Internal Test Track Workaround

**Google Play** is a trusted installer on this system and if you are an internal tester on the play store you can directly install onto the headunit. It only works in the internal test track (ITT).

![Google Play install dialog for Gretio - Automotive Scan Tool, with a Lyriq head unit listed as the target device "Gm Cadillac"](/images/2ce307e809f4.jpg)

<figure><img src="/images/4fe3ff432327.jpg" alt="Colorado infotainment screen with the Gretio app icon alone on a launcher page; the profile name reads [object Object]" width="720" height="525" loading="lazy"><figcaption>Gretio installed on a 2023 Colorado by the Google Play Store</figcaption></figure>

This is a longstanding well known workaround, and frankly its confusing why it has lasted this long. Obviously devs need 'some way' to test their apps but 99% of users are likely abusing this to install APKs (as is their right).

Does this actually get you any real access? On certain builds it may be possible due to gaps in SELinux, but in practice no. The same can be said for any Android phone. If GM keeps security patches going this won't be a problem (though older vehicles rarely get them).

### ADB

You can't out of box enable ADB on the headunit. You can certainly enable "usb debugging" but it doesn't quite do everything needed.

The fastest track to truly enabling it is sending this over UDS over DoIP or CAN which appears to be an escape hatch left in for bench testing and possibly even in vehicle testing.

```text
31 01 03 32 DD 42 10 EE
│  │  │     │  │  │  └─── EE = ADB value: 01=ENABLE, 00=DISABLE
│  │  │     │  │  └────── DATAID = 0x10 (16)
│  │  │     │  └───────── COMPID = 0x42 (66)
│  │  │     └──────────── DD = Domain ID
│  │  └────────────────── RID = 0x0332
│  └───────────────────── sub-function = 0x01 startRoutine
└──────────────────────── service = 0x31 RoutineControl
```

But as you guessed it! The SDGM or radio will block you! Even if you somehow bypass that, the customized adbd is only going to allow keys provisioned by GM so there is still no adb. Not by any easy method anyway.

### GM Auth and OTA

This is the interesting one... How does the headunit auth against GM? (we need this for OTAs).

The auth is composed of 3 configurable parts (loaded at factory or through SPS)

1.  The id of the gateway (CGM)
2.  The id of the radio (CSM)
    
3.  The vehicle's VIN
    

it also has some hard coded values which are simply baked into the image.

![Sequence diagram: radio generates a key in the TEE, enrolls with VIN, CSM and CGM IDs, and GM returns a signed cert only if they match](/images/af6848626d16.png)

From this point forward the signed cert is used for all further api communications from the headunit. The car uses this cert to check for OTA 'campaigns'. While the kickoff is done within the radio, the actual download and OTA update is performed by the telematics module.

![Sequence diagram of an OTA: GM pushes campaign metadata to the radio, the telematics module downloads the package and flashes the target ECU](/images/8d6a3dd477ec.png)

We had the idea of just hijacking this to install our own cert on the radio (support a connected car without GM!), but sadly too much relies on the GM CA so this doesn't quite work without adding our own CAs in...

One of the obfuscated values is an oauth2 'secret' which appears to be shared for a given Android build. However, it's not really a big deal if its leaked because the true 'secret' is the 3 configurable values (the VIN, CGM id, and CSM id). Together its like 40 bytes on entropy which is plenty for security purposes. Regardless we left out the obfuscated values just to be on the safe side.

For any GM engineers reading this: It's 2026, obfuscation is not really security and it took 5 minutes to reverse those.

### The Security Angle

You can't just bypass Global B by just plugging a laptop into the vehicle. There is certainly an opportunity for exploits that can escalate your permissions for a given module, but these would simply be fixed in an OTA... Plus the layers of security isolate any impact from this.

However there is one Elephant in the room that needs to be addressed. **SPS.**

Anyone can buy 'SPS', it is mandated by U.S. law and other countries (i.e. China has its own set of laws governing this).

It costs $4,400 a year or $45 for a temporary VIN license. SPS3 gives you a credential which you can use to get $27 access. GM also provides a program known as "DPS" to its suppliers which allows programming an arbitrary file and provisioning the $27 access just in time in a way similar to SPS3. It won't let you put your own software in, but it does let you do other privileged actions (namely key reprogramming).

The problem is the exchange between SPS3/DPS and the vehicle isn't well protected, so in practice that $27 access can be obtained outside of the flow GM intended.

Doing that is probably against GM's EULA _(i tried to find one as we don't actually use any GM software here, [closest I found is this](https://www.acdelcotds.com/eula)),_ but it's the only sane way to actually gain access to your own vehicle. Arguably such actions are protected by the various laws that protect right to repair in automotives and even the [DMCA exemptions](https://www.autocare.org/detail-pages/blog/aina/2024/11/01/new-exemption-to-digital-millennium-copyright-act-broadens-protection-for-vehicle-data-access). I'll leave that one for lawyers to argue about, but these sorts of things are already being done in the wild to support various tuning actions, so I'm not revealing anything new here. It's already being done.

Even with the legal DMCA carve out, GM will probably ban your account if they catch onto your actions. So it's an uphill battle. GM used to sell infinite SPS subscriptions for a given VIN but this notable change happened several years ago that limited it to the # of events SPS2/3 will allow before it blocks you. This change mostly hurt tuners who were using this to get through $27.

![GM SPS2 terms: per-vehicle subscription expires after 24 months or once programming events equal the number of programmable modules](/images/607260353ac4.jpg)

The security angle makes little sense as SPS2 access isn't tied to a verified identity, so anyone who buys it can perform privileged actions. Granted GM does try to counter this with waits and secondary measures (like server side timers if you lost all your keys) buuuut it's nothing anyone determined can't work around.

GM would probably use this as an argument to lock out third party repair even further but frankly no one can vouch for every dealership tech either. It's an impossible task to vet every single tech especially when there is already a severe tech shortage (and lack of pay).

You can also just crack open the module and write your own software, but with GM's handshake to do a full end to end fix you'd need to do this for every single module. Each one likely has efuses burnt in for secure boot and/or hardware HSMs which in many cases will mean you would need to physically replace or otherwise directly modify the CPU, UFS, and/or possibly other TEE chips if present (some ECUs have multiple chips).... This is done for niche tuning scenarios (i.e. HpTuners) at insane costs ($1500). In practice this is just not feasible for any long term right to repair.

Exploits that can circumvent secure boot are extremely rare, and if present could simply be patched by OTA. Even if you do find such an exploit it's likely a nuanced specific implementation to one module not all 30. Occasionally there are segments that don't fall in secure boot (for various reasons), but many times the only way to access that is to unsolder memory, reprogram it, and solder it back in....

#### The New Qualcomm Era

The above pictured headunit was from a 2023 Chevy Colorado with an ~intel~ chipset. [Intel scuttled their entire automotive offerings in 2025](https://www.oregonlive.com/silicon-forest/2025/06/intel-will-shut-down-its-automotive-business-lay-off-most-of-the-departments-employees.html). Newer vehicles use a [Qualcomm SA8155.](https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/qul7413_sa8155_productbrief_r4.pdf)

<figure><img src="/images/04d704d41816.jpeg" alt="Lyriq dash display fast charging at a Tesla Supercharger, showing 26% battery and 176 kW" width="720" height="368" loading="lazy"><figcaption>2025 Cadillac Lyriq</figcaption></figure>

The qualcomm chip is significantly faster than the Intel one and contains some subtle differences like a different hypervisor and host OS. We will report deeper on these minor differences in the future. GM is only giving the qualcomms love in terms of OTAs. The above pictured 2025 runs on AAOS 14, and supports features like Youtube Videos out of box.

### Summary

The system GM made works, today. Sure. But do we really trust GM to maintain this for 10 years? 20 years? 30 years? At what point do they call these old systems 'vintage' and just tell people to pound sand if they need to replace a control module? Or add a key fob? Or just use Google Maps? Or just do a simple security update?

What if GM goes defunct which is an ever increasing risk with Chinese autos?

A significantly better system would tie the SDGM and certs to a password, securely stored in the SDGM. The owner of a vehicle sets this when they first obtain it, and any action (even from an official GM tech) requires an unlock. If the owner forgets the password then the SDGM can be pulled and reset manually by shipping it to a secure trusted facility. This is basically how Apple does it with their Macbooks and there is 0 reason it wouldn't work for a car. In this system the owner becomes the source of truth, and its frankly more secure than GM's implementation. And it supports right to repair? It's just a win all around... I can only dream though.

#### Licensing

[The ABCs of Global B](/the-abcs-of-global-b/) by [Surreal Development LLC](/) is marked [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)<img src="/images/97111c7c4815.svg" alt="" role="presentation" width="22" height="22" style="display:inline;margin:0 0 0 4px;vertical-align:middle"><img src="/images/7c9777955596.svg" alt="" role="presentation" width="22" height="22" style="display:inline;margin:0 0 0 4px;vertical-align:middle">

##### Disclaimer

_Posts in this category are my personal commentary and independent research. They are not official Surreal Development guidance, and they do not represent the views of any current corporation. Nothing here is a support recommendation for Gretio or any other product. if you act on it, you're doing so at your own risk._

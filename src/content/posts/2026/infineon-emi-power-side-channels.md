---
title: "Infineon EMI Power Side Channels"
date: 2026-10-23T17:07:24.000Z
updated: 2026-10-23T17:07:24.000Z
categories: ["automotive-ramblings"]
excerpt: "I tried to pull an AES-CMAC key out of a TC3xx HSM over the air. I didn't get it. Here's the setup, what did leak, and 207 GB of traces so you can try :)"
cover: "/images/72527b61bb68.png"
coverAlt: "Heatmap of SecOC versus plain frames over time and frequency, with one sharp vertical stripe about 63 microseconds after the CAN frame ends"
---

In [part 2](/rooting-the-cadillac-part-2-secoc/) I said we could "Think Really Fast" to get SecOC frames.

Well, TLDR if it wasn't obvious. I was referring to EMI based power side channels. 

It didn't work. I didn't get the key :(

But still, a negative result is still a significant result.



## The idea

Transistors, clocks, and other traces emit EMI which we can pick up in the open air. So, the theory is that we can
'pull' AES keys out of the air simply by looking at the EMI emissions of a target.

My target is the Infineon Tricore TC3xx series of MCUs. These are used on a variety of boards, not just in GM but across OEMs. These are complex MCUs, and have many internal components within their module and of course printed on silicon.
Each of these generates its own EMI signature.

<figure><img src="/images/b7c2e46d669b.png" alt="Hand-drawn block diagram titled Infineon TriCore TC3xx EMI view: crystal oscillator, PLLs and clock tree on top; two CPU cores up to 300 MHz and the SRI bus, flash and LMU; a dashed HSM security domain holding an ARM Cortex-M3 on its own clock and an AES accelerator; I/O pads and comms; and the EVRC switching core supply, EVR33 linear regulator and decoupling along the bottom" width="1337" height="858" loading="lazy"></figure>

'Where' a given chip actually emits its EMI is also a complex subject. I.e. the HSM's EMI may not be from the transistors themselves, but simply from their effect on the clock cycle and power draw... So the location of the noisiest signal can be in a different spot from what produced it... Especially if you are trying to just stick a giant probe over it like I am.

The Infineon Tricore TC3xx series in particular is special. It has an HSM, but its HSM shares a different architecture and notably operates on a different clock cycle. Its HSM is actually an ARM Cortex M series, printed on the silicon. The ARM Cortex M itself has been modified to support a dedicated AES Accelerator.

That AES Accelerator implements AES-CMAC, which is what is used to both sign and validate SecOC CAN frames, and others.

In other words, our target is not the Tricore 'Cores' and not the ARM Cortex HSM, but rather the AES Accelerator of unknown origin... But presumably it is of Infineon design.


## Why?

<figure><img src="/images/76fb5f853bc8.jpeg" alt="A floor-to-ceiling rack holding hundreds of comma devices, each with its screen lit, labeled with colored tape and wired into rows" loading="lazy"><figcaption>A wall of comma 4s. Every one of these runs openpilot.</figcaption></figure>

That's a wall of comma devices running [openpilot](https://github.com/commaai/openpilot), open source driver assistance that already works on a lot of cars. If you can get the key to leak from EMI, then you can get openpilot to work on modern cars. Not just GM, but Toyota, Honda, Ford, and anyone else who implements a SecOC derivation in the future.

That's it. That's the whole motivation :).

## The Target Boards

I have a few candidate boards. Each uses an Infineon Tricore CPU.

<figure><img src="/images/8ab1a2ae82b9.jpeg" alt="Front view camera module board with an Infineon TriCore TC397 in the middle, a lens mount covered in black sealant on the left and a connector on the right" loading="lazy"><figcaption>Front view camera module. Infineon TC397XX, and an EyeQ processor.</figcaption></figure>

<figure><img src="/images/ae4ad064512d.jpeg" alt="SuperCruise IPM board: a row of colored connectors down the left edge, a large square processor under a metal lid in the center, and pink thermal pad residue on the chips" loading="lazy"><figcaption>Image Processing Module (ACP3, SuperCruise). Infineon AURIX TC397 safety MCU alongside a Qualcomm SA8530P.</figcaption></figure>


## The bench

The setup for this is a [NewAE 15mm probe](https://www.newae.com/product-page/h-fieldprobe), a Rigol Oscilloscope, and a [NewAE LNA](https://chipwhisperer.readthedocs.io/en/latest/Tools/CW502%20Low%20Noise%20Amplifier.html) (low noise amplifier).

<figure><img src="/images/fad9e5731ec0.jpeg" alt="Hand holding the NewAE 15 mm H-field probe, its SMA end wrapped in kapton tape, in front of a Rigol oscilloscope with three channels connected and a CAN frame on screen" width="480" height="640" loading="lazy"><figcaption>The NewAE 15 mm H-field probe in front of the Rigol. Sorry, it's vertical.</figcaption></figure>

15mm is massive for a chip this size, so I divided it into regions based on a numpad system. I.e. position 5 (over the silicon) is the direct center.

<figure><img src="/images/a9d1f7084cb0.svg#light" alt="Top view of a square TC3xx package with nine overlapping probe circles numbered like a keypad, 7 8 9 on top and 1 2 3 on the bottom; the center circle 5 is shaded and covers most of the package, and the eight outer circles hang over its edges; a small filled triangle in the package's top-left corner marks pin 1" width="620" height="560" loading="lazy"><img src="/images/b8648ae40b10.svg#dark" alt="Top view of a square TC3xx package with nine overlapping probe circles numbered like a keypad, 7 8 9 on top and 1 2 3 on the bottom; the center circle 5 is shaded and covers most of the package, and the eight outer circles hang over its edges; a small filled triangle in the package's top-left corner marks pin 1" width="620" height="560" loading="lazy"></figure>

That's absolutely brutal placement, but 15mm is what I have to work with. p5 and p9 were the best positions, and that judgement was made entirely by feel. p7 is the most noisy.


## One Trace

<figure><img src="/images/c41720c9a41e.png" alt="Three stacked panels for one capture: the CAN-H bit pattern ending at EOF, the raw H-probe signal which looks like uniform noise, and a spectrogram of the probe signal with horizontal clock lines and one faint vertical streak labeled anchor at EOF plus 62.1 microseconds" loading="lazy"><figcaption>One capture at probe position P9. (a) CAN-H, (b) the H-probe channel, (c) its spectrogram, 100 ns by 10 MHz. Time is relative to the end of the CAN frame.</figcaption></figure>

Most power side channel analyses use unrealistic scenarios such as programming a target chip to loop infinitely and calculate some AES value (which could be thousands of operations a second).

My approach is to instead send a single SecOC frame (or more accurately... wait on a SecOC frame) and observe the result naturally. While this means traces are much slower, it requires 0 exploitation. You just trigger the AES-CMAC operation however you can, and on a vehicle component that is always going to be a CAN Frame.

So, the scope triggers on the CAN SOF. The trace is then downloaded to a computer where it is stored for later processing.



## Finding AES-CMAC

<figure><img src="/images/72527b61bb68.png" alt="Heatmap of Welch t statistic over time and frequency comparing SecOC frames with plain frames; nearly flat everywhere except a strong red vertical band at about 63 microseconds after EOF spanning most frequencies, with a weaker cluster from 25 to 50 microseconds" loading="lazy"><figcaption>SecOC frames (n = 49,572) against plain frames (n = 6,199), aligned to the CAN EOF, probe position P5. Welch t per time-frequency cell.</figcaption></figure>

<figure><img src="/images/91663b7de337.png" alt="Histogram of anchor time after CAN EOF for two probe positions, both sharply peaked at 63.3 microseconds with a small secondary bump near 60 microseconds for P5" loading="lazy"><figcaption>Anchor latency after the CAN EOF for SecOC frames at P5 (n = 49,572) and P9 (n = 14,923). Both medians are 63.3 µs.</figcaption></figure>

The wide trace is simply too much data, so we narrow it down by finding an 'anchor' (basically a surge in power). This usually occurs after a CAN frame has arrived in a mailbox, and a future task schedule picks it up.

Because it uses a task scheduler and mailbox, we have the unfortunate situation where the EOF to Anchor is not actually consistent (which is why we align on the anchor). Still, it follows a nice range.



### What about clock synchronization?

Normally power side channel analysis will sync to a clock cycle (this is what the iconic chipwhisperer does). Instead of doing this, I just oversampled at 2GS/s (and fix it in post).

## Where is AES CMAC?

<figure><img src="/images/530119258f4c.png" alt="Heatmap of power difference, SecOC minus plain, aligned to the anchor; a dark red vertical stripe at time zero, a purple bar marking a host-state region before it, an orange bar marking a CMAC transaction region after it, and a horizontal 300 MHz line that flips between blue and red across the window" loading="lazy"><figcaption>Mean log power, SecOC minus plain, anchor-aligned, per-frequency median removed. P5, n = 49,572. Bars mark the host-state region (−24 to −6 µs) and the CMAC transaction region (+2 to +26 µs).</figcaption></figure>

<figure><img src="/images/ecee0945d894.png" alt="Line chart of power difference versus time from the anchor for three bands; the 300 MHz line dips negative before the anchor and rises slightly positive during the CMAC transaction region, while the 600 MHz and broadband lines stay near zero apart from the clipped anchor spike" loading="lazy"><figcaption>Band power difference, SecOC minus plain, anchor-aligned, 1 µs boxcar. P5, n = 49,572. The anchor burst is clipped at +4 dB.</figcaption></figure>


The 300MHz band line is the only real indicator of HSM work I got in my data. Prior to the identified anchor we see some activity (likely some task scheduling in an RTOS), a spike in processing, and then back to idle.

Is the 300MHz activity the HSM? Probably. It's really the best I'm going for here.... Removing the die and taking pictures could possibly help identify it but look man I'm working blind here.

## Where is my key?

Diving deep into what is 'probably' the AES accelerator... It's just noise.


<figure><img src="/images/7c7af646679c.png" alt="Left: heatmap of Welch t for frames with a valid MAC versus frames with an invalid MAC, uniform noise with no structure. Right: histogram of all t values overlaid on a standard normal curve, matching closely with sigma 0.95" loading="lazy"><figcaption>Valid MAC (n = 5,970) against invalid MAC (n = 7,461) at P9, anchor-aligned. (a) Welch t per cell, (b) the distribution of all 101,000 t values against N(0, 1).</figcaption></figure>


To be very clear, I threw everything under the sun at the data. Nothing came out. I even varied the key, and nada.


## Plaintext Leakage

What DOES LEAK is the plaintext handling by the tricore cores. In fact this is quite loud, and doesn't take much effort at all to extract.

<figure><img src="/images/8a48ccfbb7f8.png" alt="Top: correlation energy versus time from the anchor on a log scale, flat at chance everywhere except a narrow spike reaching about 11 at time zero, with the shuffled-label band shown in grey. Bottom: heatmap of max correlation per payload byte over a 6 microsecond span, darkest for byte 0 at plus 0.35 microseconds" loading="lazy"><figcaption>Hamming-weight correlation of the wire bytes with power, P5, n = 44,615. (a) Mean n·r² over 7 bytes and 101 frequency bins, with the 0.1–99.9 % band from 20 label shuffles. (b) Max |r| over frequency per byte. The only excursion above the shuffle band is −0.35 to +0.45 µs around the anchor.</figcaption></figure>

<figure><img src="/images/150e68611bf7.png" alt="Two heatmaps of Pearson correlation between power and byte Hamming weight over time and frequency, for byte 0 and byte 2; both show a vertical column of correlated cells at about plus 0.35 microseconds, with labeled peaks at 200 and 240 MHz for byte 0 and 240 and 530 MHz for byte 2" loading="lazy"><figcaption>Signed r between power and byte Hamming weight around the anchor burst, P5. (a) byte 0, (b) byte 2.</figcaption></figure>


This isn't a surprising result, but it's nice to see it confirms the setup.

## Where this leaves things

I believe the problem is the AES accelerator is simply too fast and surrounded by too much noise to lead to a leak at my scale. I don't think the accelerator is in any particular way hardened or truly constant time (but without engineering notes, I could be wrong).

A smaller probe 'could' filter it down further and decrease noise, but this is not proven. Unfortunately, 15mm is all I had on hand and I can't budget creation of a smaller probe right now.

I also have yet to do this same technique on the RH850x series, which is something I intend to do next if there is time. The RH850x is another common automotive microcontroller.

## Try your luck!

While I did not succeed, I built a large dataset of traces which you can analyze yourself, at home. The dataset tells
you a payload, and the corresponding AES-CMAC key. Good luck!

https://huggingface.co/datasets/SnipesySpecial/tricore-secoc-emi-traces

110,717 captures across probe positions 5, 6, 8 and 9, two keys, 207 GB. P6 and P8 were a second campaign under a second key, same setup. Every trace comes with the frame on the wire, the freshness, and the key that verified it.

## Prior work

1. Katsumi Ebina, Rei Ueno, Naofumi Homma. [Side-Channel Analysis Against SecOC-Compliant AES-CMAC](https://ieeexplore.ieee.org/document/10159136/). IEEE TCAS-II, 2023.
2. Takaya Kubota et al. [A Side-Channel Attack Method against Truncated MAC](https://ches.iacr.org/2018/slides/ches2018-poster-kubota.pdf). CHES 2018 poster.
3. [Deep learning side-channel attack against hardware implementations of AES](https://www.sciencedirect.com/science/article/abs/pii/S0141933120305408). Microprocessors and Microsystems, 2020.
4. Yoo-Seung Won, Shivam Bhasin. [On Use of Deep Learning for Side Channel Evaluation of Black Box Hardware AES Engine](https://doi.org/10.1007/978-3-030-77424-0_15). 2021.
5. Ruize Wang, Huanyu Wang, Elena Dubrova. [Far Field EM Side-Channel Attack on AES Using Deep Learning](https://eprint.iacr.org/2020/1096). ASHES 2020.
6. [Virtual Triggering: a Technique to Segment Cryptographic Processes in Side Channel Traces](https://arxiv.org/abs/2210.12059). 2022.
7. [Revisiting a Realistic EM Side-Channel Attack on a Complex Modern SoC](https://eprint.iacr.org/2024/1322). IACR ePrint 2024/1322.
8. [SCATTER: A New Dimension in Side-Channel](https://eprint.iacr.org/2017/706). IACR ePrint 2017/706.
9. Infineon. [AURIX Security Solutions](https://www.infineon.com/cms/en/product/microcontroller/32-bit-tricore-microcontroller/aurix-security-solutions/).
10. AUTOSAR. [Specification of Secure Onboard Communication Protocol](https://www.autosar.org/fileadmin/standards/R20-11/FO/AUTOSAR_PRS_SecOcProtocol.pdf), FO R20-11.

### Disclaimer

_Posts in this category are my personal commentary and independent research. They are not official Surreal Development guidance, and they do not represent the views of any current corporation. Nothing here is a support recommendation for Gretio or any other product. If you act on it, you're doing so at your own risk._

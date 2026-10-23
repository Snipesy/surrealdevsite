---
title: "Maybe you should decline OTAs?"
date: 2026-07-30T21:36:04.000Z
updated: 2026-10-23T17:07:24.000Z
categories: ["automotive-ramblings"]
excerpt: "featured image from BMW USA in car advertisements Let's talk about Why. If you have not read The ABCs of Global B yet I highly recommend starting there. Tuning modern vehicles is tricky as modules will only accept calibrations signed by GM. They usually won't even allow you to enter a programming..."
cover: "/images/314ab89f46d3.jpeg"
---

_featured image from BMW USA in car advertisements_

Let's talk about **Why.**

If you have not read [The ABCs of Global B](/the-abcs-of-global-b/) yet I highly recommend starting there. Tuning modern vehicles is tricky as modules will only accept calibrations signed by GM. They usually won't even allow you to enter a programming mode without a private/public key handshake, using a credential stored only on the OEMs servers... And beyond some leaked GM credentials (which has actually happened several times) this is an impossible wall to work around without some mythical future quantum computer. All in the name of some so called security no one really asked for.

There are random high effort attacks that have worked around this but each has thus far been very expensive to pull off.

If your goal is long term right to repair and owning your own vehicle, then this article is worth a read. While obviously it focuses on GM this article actually applies to all OEMs in general.... Especially BMW.

_Disclaimer: This article is not advice. Its goal is to inform vehicle owners in the name of transparency._

## Another Disclaimer (October 23 2026)

In light of the recent [GitLab](https://thehackernews.com/2026/10/critical-gitlab-flaw-cvss-100-could.html), [php2shell](https://www.wiz.io/blog/php2shell-php-rce), [eMudhra](https://emudhra.we-have-a-problem.com/), and [other exploits this week](https://x.com/calif_io/status/2111080240978223545), _you should probably accept OTAs_. Especially on your phone, laptop, or other internet connected devices.

Even this website used to run on WordPress. I switched it to a static site roughly 2 days prior to the first known php exploitation, and completely revamped the security posture of surrealdev.com.

The worst thing an attacker gets from compromising surrealdev.com is just an email address (user data is stored separately, and significantly more securely). But still. I should have done more to protect the infrastructure and I let it go unmaintained for far too long.

... I got lucky...

Having said that, I think what I discuss in this article is still worth very serious discussion. I.e. there is also a recent iOS Jailbreak and I am torn on if I will even update my phone (or maybe I'll buy a new one) as iOS security research is something I've been really wanting to get into lately.


## AI Breaks the Illusion of Security

2026 has brought us AI which can chain exploitation and find vulnerabilities no one ever imagined, and much of this security theater is finally being shown for what it is.

Just to list some of the possibilities we can now do with AI.

1.  It is now trivial to emulate entire micro architectures. It is likely by the end of 2027 that you will be able to emulate an entire vehicle in a single prompt and several hours.
2.  AI can chain long chains of minor vulnerabilities in ways no one thought of.
3.  You can compress an entire team into a single box.

It's not hard, anyone with some Kimi K3 tokens to burn can do it right now. In fact I encourage you to try. That car in your driveway is yours, and in the USA it is perfectly legal to reverse engineer it.

Currently AI favors the attacker significantly more than it favors the defender, but this will likely flip in the next few years as software becomes more hardened. **_This means every vehicle on the road right now is in a unique position where it may as well be completely unlocked._**

### _Are these really security issues?_

In practice almost every exploit seen thus far requires some privileged local access and is hardly a real threat. For example if an exploit requires local injection into a network that is not normally accessible... Is it really a threat? Do OEMs really think someone is going to pull apart a car, add a malicious payload to a computer, and then put it back together? This isn't a Fast and Furious film it's far easier to just attach a battery powered device and move on with life.

Cars historically have been insanely open meaning a simple plug in to the OEM port would give you complete control to reprogram the entire vehicle and it's never really been a problem. If theft is a concern: in the prior article we outlined a system that would be far more effective than anything OEMs have implemented thus far.

The truth of the matter is that these measures were placed to establish parts pairing and hurt right to repair long term. [GM isn't the only one doing it, and they won't be last](https://keepandroidopen.org/). Such practices [are even starting to be declared illegal in some states](https://9to5mac.com/2024/05/29/parts-pairing-banned-by-colorado/). I'm sure the original designers of SecOC and MACsec meant well, but I suspect part of what gets these things approved is that someone saw money.

If GM were serious about security then they should bring vehicles to Pwn2Own, institute a real bug bounty program that actually pays people and credits them, and publicly publish all their service material, diagnostic software, and other information.

In reality, GM's approach to outside security research has mostly been to not engage with it.

## The state of OTAs and why you might want to refuse them

The future of OTAs on GM's vehicles is unclear.

1.  GM's process of OTAs is riddled with issues. Dead batteries, bricked modules. The list goes on. This is worth its own article entirely but it's bad. I'm happy to say the battery management is a lot better now, but now that that's fixed... Now what?
2.  GM rarely if ever adds features by OTA. [When features are added it's usually for recent (less than 2 year old vehicle)](https://gmauthority.com/blog/2026/05/cadillac-lyriq-finally-gets-surround-vision-recorder-through-ota-update/). Older vehicles seem to just get bare essential safety related updates or recalls. GM has little incentive to improve a car you already bought, so why would they? Even companies like Rivian and Tesla are running into this issue (i.e. HW3 vs HW4 and the inevitable lawsuits).
    
3.  [GM is already focusing on the next gen platform](https://news.gm.com/home.detail.html/Pages/news/us/en/2025/oct/1022-SDV-GM-centralized-vehicle-computer-platform-electric-gas-vehicles.html), abandoning the legacy platform.
    
4.  Many modules might just brick themselves if they try.
    

However, GM (and other OEMs) will probably be forced to update their existing vehicle fleet with the rush of AI code review. I give it like an 80% chance of happening (at least for the modules that won't brick themselves doing so). It's also possible GM just won't prioritize it, which _I mean if you've read this far it isn't entirely unfounded._

Those OTAs will focus on hardening parts pairing, closing security gaps, and overall making modding more difficult.... But probably won't add features to your vehicle or do much in the actual department of improving your vehicle. If anything they are likely to cause more problems,. Sooo :shrug: why would you risk an OTA update? What is there to gain exactly? It simply will become harder to repair and adapt your own vehicle. [At best you might get some in vehicle advertisements like BMW is doing.](https://www.reddit.com/r/BMW/comments/1v802of/got_this_commercial_in_my_car_today_as_part_of/)

Following this logic, the only OTA you should perform is if there is a critical safety issue that MUST be addressed... Which is rare...

Yes there is the hypothetical remote zero day, but these would almost certainly come from GM's end of the bargain (i.e. their cloud infra) and not something local on the vehicle (like its wifi hotspot). It's unlikely any OTA would patch this as these backdoors are by design (this is its own red flag).

I would love to be wrong. I would love for OEMs to come out and say "_Hey, we hear you. We are committing to a sustainable and open future for our existing vehicle platform... Here's our process"_. Prove me wrong. Make me look like the stupidest person ever for raising concerns.

### Disclaimer

_Posts in this category are my personal commentary and independent research. They are not official Surreal Development guidance, and they do not represent the views of any current corporation. Nothing here is a support recommendation for Gretio or any other product. if you act on it, you're doing so at your own risk._

---
title: "Gretio 1.08 Preview"
date: 2026-07-04T07:09:28.000Z
updated: 2026-07-11T07:23:58.000Z
categories: ["gretio"]
excerpt: "A preview of what's coming in Gretio 1.08. Global B is Stable Global B beta has been out for a little over a year now and is now considered stable. With 1.08 several major improvements are being done Initial connection to Global B is now much faster. Many minor mistakes have been fixed, data..."
cover: "/images/8be2f80b19ad.png"
---

A preview of what's coming in Gretio 1.08.

## Global B is Stable

Global B beta has been out for a little over a year now and is now considered stable. With 1.08 several major improvements are being done

1.  Initial connection to Global B is now much faster.
2.  Many minor mistakes have been fixed, data processing fixes, and more.
    
3.  The control scheme for global b is significantly more tested and validated.
    

## CommandV2

The big new change. The way Gretio handles ECU commands has been completely overhauled and can support any complex scenario we can dream of.

![Gretio CommandV2 DPF Service Regeneration control at step 2 of 2, monitoring regen status PIDs](/images/8be2f80b19ad.png) ![Gretio CommandV2 Tire Pressure Placard control with front and rear pressure inputs and sliders](/images/42741e54aeab.png)

The notable new features are

1.  Gretio monitors PID inputs for conditions... Such as when a Service regen completes.
2.  Gretio supports more complex inputs, i.e. for TPMS relearns (no more raw dogging hex!)
3.  Controls can backtrack and jump between states on conditions.
4.  Controls support inner adaptive conditionals (i.e. we can write one control which can work on multiple vehicles)

Our current goal is to get the existing Gretio DB data set working well on CommandV2, but eventually our goal is to evolve and support more complex procedures. The biggest priority for expansion is... Brake bleeds. To perform a brake bleed in conjunction with Gretio requires you to coordinate with the actual valving of the vehicle... This is a tricky multi step process, and the layout varies. But with the power of AI its significantly easier to break it down than it used to be _(that was a pun)_.

<video controls="" preload="metadata" playsinline="" src="/images/79021050baee.mp4" width="720" height="323"></video>

Here is a (compellingly real) simulation of what it would look like on an **LML**.

The exact specifics vary... Some vehicles you may need to tap the brake, others not. Others the automated brake bleed is done in addition to a traditional bleed... Vehicles like the Lyriq have a psuedo brake by wire system. Not to mention which wheel is first may or may not even matter. It's a mess. We've had the full brake bleed control systems reverse engineered for years and are only now finally getting to modeling it in Gretio.

## DataV2

A behind the scenes change, but it adds some niceties.

1.  Most PIDs no longer do equation processing to improve performance, especially for larger PIDs found on Global B.
2.  Min/Max values are now set appropriately everywhere.
    
3.  Data V2 is compressed.
    
4.  We now support 'hidden' PIDs. This is useful because many modules have a bunch of bogus states for various dumb things that you would never really want to look at yourself, but may be important for Gretio internals. It is likely we will move some existing PIDs here as well.
    
5.  It's just a lot harder to hold wrong.
    

## Release Schedule

~The Android Open Beta and iOS TestFlight of 1.08 will begin next week on the Play Store.~

Sorry the release has been delayed slightly as we are in the process of relocating which is delaying final validation passes.

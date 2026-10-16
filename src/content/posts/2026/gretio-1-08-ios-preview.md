---
title: "Gretio 1.08 iOS Preview"
date: 2026-07-29T05:57:50.000Z
updated: 2026-07-29T05:57:50.000Z
categories: ["gretio"]
excerpt: "Our last post showed off Gretio 1.08 features, but it didn't reveal much about iOS. Gretio 1.08 Preview Gretio iOS 1.08 will be releasing over the next week alongside Gretio Android 1.08. ControlV2 iOS Gretio is getting the same control v2 treatment as Android. It just looks a little different as..."
cover: "/images/5536037577cc.png"
---

Our last post showed off Gretio 1.08 features, but it didn't reveal much about iOS.

> [Gretio 1.08 Preview](/gretio-1-08-preview/)

Gretio iOS 1.08 will be releasing over the next week alongside Gretio Android 1.08.

## ControlV2

iOS Gretio is getting the same control v2 treatment as Android. It just looks a little different as its built natively for iOS, but it functions the exact same as described in the prior post.

![Gretio iOS ControlV2 DPF Service Regeneration screen with test in progress and live regen PIDs](/images/bc1f4d9a3649.png)

## Dashboard: Adaptive Grid

Gretio 1.08 introduces adaptive dashboard grid which brings iOS in line with Android on dashboard features.

**Adaptive Grid** capitalizes on the fact that almost all Gretio Android users keep their dashboards in a perfect grid, and so a full customizable grid layout is generally not required. And so behind the scenes the grid system is just a list with 'extra steps'. It is inspired by css grid layouts which will automatically fit the items as best as it can to the grid.

While this can lead to some odd gaps in some scenarios where the layout cannot perfectly fill, it does mean that the dashboards do not require a underlying grid system and thus their layout is purely adaptable to any screen size, device, and orientation.

![Gretio iOS dashboard in adaptive grid layout with voltage gauge, status tiles and MAF graph](/images/8714378eecf8.png)

All old dashboards cleanly migrate to the new system, and existing dashboards can be converted to/from grid form at any time without information loss.

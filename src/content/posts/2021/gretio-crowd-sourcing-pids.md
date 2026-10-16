---
title: "Gretio Crowd Sourcing PIDs"
date: 2021-06-25T05:47:42.000Z
updated: 2026-05-06T00:24:59.000Z
categories: ["gretio"]
excerpt: "If you explore the options of Gretio you may come across the option \"Crowd Source PIDs\" What is it? Why do you care? Well it's really what makes Gretio work at all. Whenever you discover a new vehicle your scan results are uploaded, and likewise other scans are available for you to use. In..."
cover: "/images/43a9dfe5f1c1.png"
---

If you explore the options of Gretio you may come across the option "Crowd Source PIDs"

![Gretio OBD2 Settings screen with the Crowd Source PID Scanning option enabled](/images/cfd3dc42f1be.png)

What is it? Why do you care?

Well it's really what makes Gretio work at all. Whenever you discover a new vehicle your scan results are uploaded, and likewise other scans are available for you to use. In doing so you can completely skip doing the long scan. Meanwhile this scan data is used later to bring more features to Gretio.

The data collected is pretty mundane. It lists the module, its address, and the result of every scan ID. The scan ID is used later on as a direct reference to what the module supports as well as explicitly what it does not support.

![Sample crowd-sourced scan record for the Electronic Brake Control Module with supported and unsupported scan IDs](/images/43a9dfe5f1c1.png)

So how do we trust this data?

We don't. There are numerous sanity checks done before we take a potential scan as viable. Part of those checks are done in cloud, and part on your phone.

When those checks are completed... The end result is a near instant connect to a vehicle. Amazing!

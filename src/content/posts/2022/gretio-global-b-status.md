---
title: "Gretio Global B Status"
date: 2022-03-24T04:43:23.000Z
updated: 2026-05-06T00:24:46.000Z
categories: ["gretio"]
excerpt: "GM has started introducing Global B in MY2022 (there was also several models in MY2020 and MY2021). Global B is a new electronics architecture for GM. It also changes the diagnostics architecture which is what Gretio uses to function. The changeover will take time as a new database has to be..."
cover: "/images/4dca66cf637d.png"
---

GM has started introducing Global B in MY2022 (there was also several models in MY2020 and MY2021).

Global B is a new electronics architecture for GM. It also changes the diagnostics architecture which is what Gretio uses to function. The changeover will take time as a new database has to be created and tested. Rest assured we're working on it :).

Currently, Gretio has been optimized to support different protocols. We have also built an initial PID and DTC database (Global B will use a separate Database). These changes are being made in the Beta version of Android Gretio.

**How do I know if my vehicle is Global B?**

At present time Gretio will fail to find a Network. Standard OBD2 apps should still work but will report 29bit CAN instead of 11bit.

Most model refreshes after 2022 will be Global B. An example 2022 Global B vehicle is the 1500 Silverado with the 3.0L LM2.

**Will I need a new OBD2 adapter?**

Probably not. There are 2 CANs on the OBD2 port in OBD2. The standard 11bit OBD2 500kbit/s CAN is now 29bit 5Mbit/s CAN-FD, but this can run as legacy 500kbit CAN.

Newer adapters should incorporate CAN-FD.

In addition there is 100/1000 Mbit/s ethernet across 4 pins on the OBD2 port. This link works the same as the standard UDS over CAN-FD but is faster.

SWCAN is not ran to the OBD2 port. In addition, it seems GM is phasing out SWCAN just in general. The easiest way to differentiate GLOBAL A vs GLOBAL B is the presence of the SWCAN on PIN 1. On GLOBAL B this PIN has a secondary CAN-FD network (not used for diagnostics).

**Is there extra Security on Global B?**

Global B has a dedicated diagnostic or gateway module (like what was introduced in MY2017 and later upda). This module provides security. In terms of diagnostics there doesn't seem to be any added security so Gretio and other third party apps will still function fine.

**What's Changing?**

The methods Gretio uses to detect vehicles will change. Gretio will try to use standard OBD2 protocol to determine the underlying OEM protocol. Generally, it will work automatically, but if needed you can manually select the diagnostic protocol. Selecting a protocol will also skip the protocol check which improves connection time by several seconds.

These settings used to be known as "Link Preference" and was used to toggle between SWCAN and HSCAN modules.

![Gretio Diagnostic Protocol dialog with Auto, GM Global A (HS CAN), Global A (SWCAN) and Global B options](/images/4a09e77842de.png)

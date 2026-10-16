---
title: "Gretio Multi Device"
date: 2022-08-02T06:09:32.000Z
updated: 2026-05-06T00:24:39.000Z
categories: ["gretio"]
excerpt: 'Did you know Gretio Android can work on multiple devices simultaneously? To start, both devices must be on the same WiFi network. One device must act as the server and connect to your OBD2 device. The client device must then enter the "Server Selection" menu. Gretio uses multicasting to find other...'
cover: "/images/91cdde835666.jpeg"
---

Did you know Gretio Android can work on multiple devices simultaneously?

To start, both devices must be on the same WiFi network. One device must act as the server and connect to your OBD2 device. The client device must then enter the "Server Selection" menu.

Gretio uses multicasting to find other devices. The reliability of this depends on your WiFi configuration, so it may take several tries to discover the other device.

![Gretio Servers menu listing discovered devices on the WiFi network with IP addresses](/images/b703c932d6de.jpg)

Once you have tapped a server both devices will go into pairing mode. Pairing is required to securely link the two devices.

Copy the pairing code to the device acting as the server.

![Gretio prompt saying authorization needed with a pairing code to enter on the other device](/images/581761114c64.jpg)

![Gretio server-side dialog asking for the pairing auth code with Deny and Accept buttons](/images/6815d64b3332.jpg)

And you're done! Both devices will now work together. The pairing process only needs to be done once and future connections will happen instantly.

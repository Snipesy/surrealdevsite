---
title: "Gretio iOS Data Logs"
date: 2026-08-03T20:21:27.000Z
updated: 2026-08-03T20:28:05.000Z
categories: ["gretio"]
excerpt: "It's about time. Coming soon (after the ControlV2 release). Charts A video is worth a thousand pictures. The charts and gesture system are built from the ground up to support analysis on the go while being efficient at displaying millions of data units. Starting a Record Just tap the little..."
cover: "/images/d1290d545330.jpeg"
---

_It's about time. Coming soon (after the ControlV2 release)._

## Charts

A video is worth a thousand pictures. The charts and gesture system are built from the ground up to support analysis on the go while being efficient at displaying millions of data units.

<video controls="" preload="metadata" playsinline="" src="/images/a924db9f0d1c.mp4" width="590" height="1280"></video>

## Starting a Record

Just tap the little recording icon in a dashboard. And you are now recording!

![Gretio iOS dashboard with a red arrow pointing to the record button in the top right](/images/b6a4143add13.jpeg)

## Open Log Format

Gretio's log format is byte for byte identical to Gretio Android, meaning any existing workflow is compatible. Gretio's log format is simple, open, and can even be easilly parsed by AI.

Specifically, the log format is a zip file with 2 csv files.

-   A"meta" file, containing metadata about the vehicle and various PIDs such as their name, ID, and units
-   A "data" file containing the actual log measurements sorted by "TIME,ID,VALUE". TIME is a unix timestamp in milliseconds.![Exported Gretio log zip in Finder, unzipped into data.csv and meta.csv files](/images/eed473876269.png)

[Here's a sample log](/images/4a232b97c69c.zip)

Logs can be exported in app (i.e. emailed, shared in iMessage, etc...) or simply exported directly from the Files app.

---
title: "Gretio Android UI Changes"
date: 2025-06-22T04:32:09.000Z
updated: 2026-05-06T00:24:30.000Z
categories: ["gretio"]
excerpt: "Hello Gretio users! After the rollout of Global B, Gretio Android will be seeing some much needed UI changes. Light Mode Gretio will now support a light mode. It will automatically change to day or night mode based on your system. If you don't like this, you can manually pick your favorite in..."
cover: "/images/d7001fec4d78.png"
---

Hello Gretio users!

After the rollout of Global B, Gretio Android will be seeing some much needed UI changes.

## Light Mode

Gretio will now support a light mode. It will automatically change to day or night mode based on your system.

![Gretio Modules screen in light mode, listing ECM and BCM with Info, DTCs and Controls buttons](/images/a3d77fe1d5d8.png)

If you don't like this, you can manually pick your favorite in settings.

![Gretio Preferred Style dialog with System, Dark and Light options, Light selected](/images/59fb70c90dd3.png)

## Edge to Edge

Gretio Android has been highly reworked to support edge to edge to the best of my ability. Gretio has always been an "edge to edge" app, but many UI elements fell within insets. This is no longer the case.

### Edge to Edge Dashboard

Gauges can now be dragged behind camera bumps and system gesture areas.

This creates some challenges when customizing as you can't really 'edit' items in these regions. To fix this we added a special gesture system which allows you to edit a dashboard regardless of the configuration.

In this example you can see the resize bars re positioned to avoid the exclusion zones (red areas).

![Battery voltage gauge in edit mode, its resize handles rerouted out of the red exclusion zone](/images/6ea2441278b4.png)

![Animation of a full-screen runtime chart gauge being resized and snapped to a grid, with red exclusion zones at the screen edges](/images/c9eee5bf60b4.gif)

### Edge to Edge Menus

Most menus now support edge to edge display with app bars that can move out of your way.

On Android Phones. **This significantly improves the usability of the app in landscape mode.**

![Animation scrolling the Advanced Diesel Engine Controls menu in landscape as the app bar slides out of the way](/images/7c0641e4339c.gif)

### Edge to Edge Charts

![Gretio Data Log chart in landscape filling the screen, plotting Control Module Voltage Signal around 12.1-12.4 V](/images/afff3e8ad938.png)

### Edge to Edge Data Views

![Animation scrolling a landscape Data View list of ECM parameters behind the system bars](/images/94e8e80c41b6.gif)

## New Data View

Did you notice something different? The old spreadsheet is being replaced with a data view mode similar to iOS. This new style will be much friendlier to scroll through on a mobile phone. It will also replace the default style when executing controls (i.e. a service regeneration).

![New Gretio Data View on a phone: ECM parameters as cards with large values, like voltage 12.30 V and monitor status Yes/No](/images/34b7a33ff7c6.png)

We are excited to see what you can with your new space!!

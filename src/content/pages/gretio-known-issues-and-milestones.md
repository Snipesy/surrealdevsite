---
title: "Gretio Known Issues and Milestones"
date: 2022-05-26T19:58:58.000Z
updated: 2022-08-05T11:36:43.000Z
excerpt: "Upcoming Features Global B Support VIN Specific Dashboards Scripting and Calculated PIDs Dashboard sharing iOS Gauges Dashboards Auto connect and other proximity features on Android High Priority Known Issues [Android] [Fix in Beta] Android 13 Device Management Screen crashes. [Android] Dashboard..."
---

## Upcoming Features

-   Global B Support
-   VIN Specific Dashboards
-   Scripting and Calculated PIDs
-   Dashboard sharing
-   iOS Gauges Dashboards
-   Auto connect and other proximity features on Android

## High Priority Known Issues

-   ~\[Android\] \[Fix in Beta\] Android 13 Device Management Screen crashes.~
-   \[Android\] Dashboard sometimes does not resume after connecting to a vehicle: Temporary fix is to leave that screen and go back to it.
-   ~\[iOS\] Device will not disconnect: Investigating. For now, simply force close the app. Many times when this occurs you will need to disconnect the OBD2 device from the vehicle as well.~ Fix rolled out in iOS 1.06.05
-   ~\[iOS\] Hangs on connecting when offline or poor connection.~ Fix rolled out in iOS 1.06.05
-   \[Android\] Hangs on connecting when offline or poor connection: We are working on better ways of detecting this issue. It can take 30s or longer for the system to timeout.

## Low Priority Known Issues

-   \[Android\] Large data logs are slow to read: We are working on ways to improve this many of which are already implemented. Gretio must optimize the list, and this is a time-consuming process. Faster devices will be much smoother.

## Unfixable Issues

"PID Reads 0.0", "Data Cache Missing", "Request Timed Out", "DTC Clear Failed", "Link and Pair Device Issues", "Failed to Initialize", "No valid network found"

These errors are either unfixable or intended behavior. Read more about them in the Q&A.

[Gretio Common Questions, Issues, and Answers – Surreal Development](/gretio-common-questions-and-answers/)

OBDLINK Keeps Blinking Disconnect: Usually a sign the app was forcible quit. This is normally not a problem but can sometimes require the obd2 device to be unplugged and plugged back in.

\[iOS\] OBDLINK Will not connect again after disconnecting: This is some bug between the iOS EaAtAccessory stack and the OBDLINK. The only fix is to disable bluetooth and re enable bluetooth OR unplug the OBD2 adapter and plug it back in. Gretio has mitigations to avoid this issue but it can still happen.

vLinker Mc+ Does not work on SWCAN: The vLinker is not an official device. There is nothing wrong on our end and we have already implemented work arounds for these devices. Contact the maker or seller of the device for support. _While Gretio does currently work with the vLinker we make no gurantee it will continue working._

LMM Has No Controls: The LMM is not directly supported by Gretio and its unlikely we will add full support for it.

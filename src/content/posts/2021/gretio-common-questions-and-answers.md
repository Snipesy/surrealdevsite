---
title: "Gretio Common Questions, Issues, and Answers"
date: 2021-07-04T16:34:56.000Z
updated: 2026-05-06T00:24:55.000Z
categories: ["gretio"]
excerpt: "What device do I need? Checkout Which OBD2 Device to buy? – Surreal Development What Vehicles does Gretio Support? Gretio Support Vehicles Can Gretio do programming? Yes. But GM has a very limited number of features which can be programmed over OBD2 without flashing/programming a new calibration...."
cover: "/images/2fe23e548c9d.png"
---

**What device do I need?**

Checkout [Which OBD2 Device to buy? – Surreal Development](/which-obd2-device-to-buy/)

**What Vehicles does Gretio Support?**

[Gretio Support Vehicles](/gretio-support-vehicles/)

**Can Gretio do programming?**

Yes. But GM has a very limited number of features which can be programmed over OBD2 without flashing/programming a new calibration.

Gretio has no tools to edit hex files so these new calibrations have to be generated somewhere else (it requires a lot of reverse engineering). In addition, 2017+ vehicles require unlock keys which would cost about $100 per VIN. Some modules will only accept signed calibration files which can only be bypassed with hardware modification. Gretio is made to be an inexpensive diagnostic tool, so these things are just out of our budget.

**Why does Gretio require Notification permissions?**

While Gretio is in use it must show a persistent notification. This allows Gretio to ignore background execution limitations within Android.

Without it, Gretio has a chance of being terminated while connected to your vehicle. This would also cause a procedure such as a Service Regeneration to terminate.

A future version of Android (not Gretio) may fix the companion device issues. This will allow this notification to be removed. But for now, companion devices are far too buggy (as of API 33).

Gretio will not spam you with messages.

**Why do I get a "No valid network found" error?**

This means either

1.  The auto protocol failed to determined a network.
2.  The set protocol failed to start

For #1 you can switch the desired protocol of Gretio in the settings. For most, this will be GM Global A HSCAN. This is also where you switch to low speed/SWCAN. Manually setting the protocol can sometimes be more relaible than using Auto.

For #2. The selected protocol is not working for this vehicle. You may also receive a similar error such as "GM Network init failed". In this case you can try selecting a different protocol or contact us.

**Why wont my OBD2 device connect? Why does my device "Fail to Initialize"?**

Make sure you don't have another device connected. iPhones and iPads really like to hog the device. Then make sure your vehicle is supported https://surrealdev.com/?page\_id=56

Many connection issues can be solved by unplugging the OBD2 device and plugging it back in.

Android currently has a long standing Security exploit which allows other apps to hijack connections. This means other apps can interfere with the connection, and this almost always happens during the initial startup sequence hence why you get a "Failed to Init" error. To solve this issue make sure any other Bluetooth apps are "Force Closed". You can also try restarting the phone.

If you are still having troubles connecting you should update your OBDLINK Device to the latest version: [You can do this by downloading the OBDLINK App](https://www.obdlink.com/obd-apps/obdlink-app/). If the OBDLINK Device fails to connect to the OBDLINK App [contact OBDLINK Support](https://www.obdlink.com/support/). If the OBDLINK Device connects to the OBDLINK app, but still does not connect to Gretio [contact Surreal Development](/contact/).

For other OBD2 devices such as ELM327s and vLinker MC+: Contact the manufacturer of the device.

**Why is my subscription or RPO pack gone?!  
**

As of 1.04 your subscription needs to be attached to Gretio's account. Normally this process happens naturally.

On iOS: When prompted simply tap 'restore purchases'.

On Android navigate to the "More" menu -> "Subscriptions and More" -> tap "Restore purchases".

When you restore purchases your subscription will transfer to your current account. Previous accounts will lose access.

The above only applies to iOS or Google subscriptions. Promotional offers cannot be transferred. You must use the same account.

**What phone/tablet do I need?**

For phones: We use Samsung Galaxies as a baseline. Any modern flagship brand will do just fine. Avoid Xiamoi device.

For Tablets: Same rules as phones. We use Galaxy Tab A7 Lites. While these tablets have poor performance they are perfectly suitable for Gretio. Most Chrimebooks are okay.

Windows Subsystem for Android does not have Bluetooth drivers. We do not know if Microsoft is planning on adding this support. If it is added, Gretio will be able to run on any Windows 11 device (x86 or ARM).

For iOS any device which runs iOS 14.5 or newer will work fine. M series MacBooks are not tested.

**Why does my PID read 0.0 or other 'strange value'?**

Many PIDs are from missing vehicle features. These PIDs are 'supported' by the Control Module, but do not display useful data. As far as Gretio is concerned, these are valid PIDs.

Common examples are:

-   "Boost Pressure" PIDs. These are either an internal calculation, or from a dedicated "Boost Pressure" sensor.
-   DPF and SCR PIDs on 'gas engine' ECMs.
-   Auto Stop/Start PIDs on vehicles which have this feature disabled (i.e. the LGZ 3.6L on the Chevy Colorado).
-   Duplicate PIDs where one displays proper data but the other does not. Note some PIDs have the same name but display different data. Usually one shows the raw sensor reading (Hz or Volts) while the other shows the calculated result.
-   Global B in particular has a lot of duplicate PID definitions wherein both have the same name and units, but only one reports. We're looking into ways to solve this (likely by crowd sourcing ignore lists in a similar manner to PID Scan data).

**What is "Default" in controls?**

Many controls will set some value i.e. EGR to 50%. Default simply means you are returning control back to the ECM. This is not the same as "Off" which is an explicit command to turn something off.

In Global B this has a different name "Return Control" to align with UDS nomenclature.

**How does Gretio relate to OEM tools, SnapOn tools ,etc?**

It doesn't. Gretio was made from ground up with little to no help. While we try to keep naming convention the same as OEM, it's not always easy. As such the name of PIDs and controls may differ from what your service manual lists or is found in external tools.

If you notice an error please contact us. We are always looking to improve our definitions.

**Does Gretio need to remain connected to the internet?**

No. Gretio only needs to connect to the internet once to build its caches. It is recommended your first vehicle connection is done with a WiFi connection so that all the caches are properly built and stored.

If the data cache fails to load you will see a "No Data" error with a possible reason (No internet, not logged in, etc...). Connect the device to the internet and then try again. After it has connected, the app will no longer require an internet connection until the cache is cleared. The cache may be cleared by the Android OS if storage space is low. In addition, some OEMs include bloatware or malware which clears caches automatically. If such apps exist, they will prevent the app from working offline.

**Can I run more than one control at a time?**

Sometimes yes. It depends on the control.

In Gretio many commands are considered 'sticky' meaning Gretio internally combined commands to create a combination of commands. This is useful for lighting.

**What PIDs should I monitor?**

This is a question we get a lot. And with Gretio having over 5,000 PIDs it can be really intimidating to someone only used to classic apps which may have 50 PIDs on a good day.

You should only monitor what you need to know. Don't monitor things just for the sake of monitoring things.

For performance applications we recommend a baseline:

-   MAF
-   Engine Speed
-   Exhaust Temps (Exhaust Gas Temperature Sensor, Catalyst Temperature, etc...)
-   IMAP (Intake Manifold Absolute Pressure)
-   Turbo Vane Position (if VGT equipped)
-   Accelerator Pedal Position
-   Vehicle Speed Sensor
-   Transmission Slip Speed (TCC Slip Speed)

For other applications (i.e. doing a service regen) you should monitor anything related there.. I.e. exhaust temps, regen status, inhibit reasons, etc...

Some controls will present data after execution for you.

**I don't have any PIDs or get "Request Timed Out" or "Data Cache Missing" errors**

There are a couple possibilities for this error

\* You are not connected to the internet. While Gretio works 100% fine online it needs to download some content first.

\* Safetynet restrictions are blocking your attempts [SafetyNet Checker – Apps on Google Play](https://play.google.com/store/apps/details?id=com.flinkapps.safteynet&hl=en_US&gl=US)

\* You are not 'logged in'. Try logging out of the app, and then back in.

\* The app's security key is missing. This occurs when you restore from a backup and was fixed in later versions. To fix this issue you must clear the data storage of the app.

**Why can't I clear DTCs?**

This is likely intended by the OEM. Clearing DTCs is generally not required nor recommend in vehicles newer than 2010 (approx).

This behavior is more predicable on Global B.

**Why does my OBDLINK keep blinking after I disconnect?**

This won't affect battery life as long as the blue led is blinking.

Gretio tries its best to clean up after itself but this doesn't always happen (such as if the app is forced closes). As such the adapter remains in its previous state.

The blinking LEDs are from periodic messages on the vehicles can bus. These messages control things like your speedometer, cranking, and power states. The messages will continue until the vehicle enters low power mode.

**The "Link and Pair Device" button doesn't work (or gives long errors)**

Companion device manager is broken on some phones. This is at the OS level and cannot be fixed by Gretio. It can usually be fixed with a phone restart.

Alternatively, use the legacy pairing system, pair in your phone's Bluetooth settings, and then go back into the app to add the paired device. Then press connect in the OBD2 menu.

The Legacy pairing system does not associate the device which will disable some upcoming features in Gretio.

**"Could not find an adapter" after adding the device.**

This can be caused when an adapter is recently disconnected from. Just try again until it connects. Make sure a different device did not connect as only one device can be connected at a time.

If the OBDLINK Device is stuck in discovery mode, unplug it and try again.

**I have read everything, and the app is still not working.**

1.  Step 1 is to restart your phone or tablet. Sadly, mobile phones are filled with Bluetooth bugs which a restart may fix.
2.  Unplug your OBD2 adapter, and plug it back in.
3.  Lookup how to "Clear Cache" for your device. Then do so for the Gretio App.
4.  If Clear Cache does not work, then try clearing all app data.

When in doubt, use the contact form found on this site.

**Why do data items take a few seconds to start showing data?**

Gretio tries to run as lean as it can. It only requests what it needs to request based on what the user is showing on screen. This is in contrast to how most UDS based scan tools work.

The system allows Gretio to operate with no loading screens.

**What does the app record about the vehicle?**

The app records the VIN, dashboards, and other settings in your own personal storage. Extra diagnostic data is stripped of the full VIN for anonymity wherever possible. None of this personal data is shared outside of Surreal Development.

You can manage your data within the Gretio app simply by deleting dashboards, and/ot vehicles. This will delete the data from the server.

**I don't like subscriptions**

We hear you. Gretio is really expensive to develop as it requires test vehicles to build controls and PIDs. The easiest way to fund this is with a subscription as it directly allows us to build new features, support more vehicles, and just make the app overall better.

As an alternative to subscriptions we offer "RPO Packs". These will unlock Gretio, but only for a specific set of vehicles based on the engine RPO codes (some vehicles have multiple engine RPOs).

Not all vehicles will have an RPO Pack. We tend to only make them for our most popular platforms (diesels).

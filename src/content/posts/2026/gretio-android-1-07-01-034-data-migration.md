---
title: "Gretio Android 1.07.01.034 Data Migration"
date: 2026-04-29T17:39:28.000Z
updated: 2026-05-06T00:24:20.000Z
categories: ["gretio"]
excerpt: "Hello Gretio Users! If you want to keep your Android Dashboard configurations you must launch the app at least ONCE sometime between today and May 31s on v1.07.01.034 or higher. We have changed our local database provider from Realm to Room with the intention of removing Realm from Greito in a few..."
cover: "/images/cd40c10922c3.png"
---

Hello Gretio Users!

**I****f you want to keep your Android Dashboard configurations you must launch the app at least ONCE sometime between today and May 31s on v1.07.01.034 or higher.**

We have changed our local database provider from Realm to Room with the intention of removing Realm from Greito in a few months. Realm was a local database provided by MongoDB, but it has not been maintained in some time. It was good tech back in 2017, but it just hasn't aged well.

Realm has a complex plugin system which has been the source of numerous issues in Gretio's deployment pipeline. As such we (and many other apps) have decided to replace it with the new standard: Room. v1.07.01.034 of Gretio operates 100% on Room, but still contains Realm to migrate data so users can migrate their dashboard to the new storage format.

For most active users this will just happen silently, but if you do not open Gretio very often it will be important to launch the app at least once (the migration takes microseconds)

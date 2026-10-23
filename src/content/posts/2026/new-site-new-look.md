---
title: "New Site, New Look!"
date: 2026-10-15T20:25:08.000Z
updated: 2026-10-15T20:25:08.000Z
categories: []
excerpt: "Now with Open Source!"
cover: "/images/06b8e4779160.png"
coverAlt: "Four-panel comic. Snipesy shows Claude the Surreal Development logo; Claude asks 'you made this?', yoinks the logo, builds an entire website around it, then tells a sweating Snipesy 'I made this.'"
---

Whoa this looks different?

Since like ~2017 Surrealdev.com has been hosted a EC2 graviton t4g,
and it used wordpress (shudder). I mean wordpress is great, but I just
really want more control. Plus I needed to maintain infra... (bleh)

While I was writting the "What is Not Malware?" blog post, I noticed it
was annoyingly hard to write code. With this new static site system, the
code is simply a markdown block rather than some weird html hacks.

And it looks better. It uses [Astro](https://astro.build/)

Anyway, its the same sites. Some things changed. And, to further my mission of transparency. It is now open source.

https://github.com/Snipesy/surrealdevsite

I also got insanely lucky. I did this like 3 days before the first [php2shell](https://www.wiz.io/blog/php2shell-php-rce)] exploitation.
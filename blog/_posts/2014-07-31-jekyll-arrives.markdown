---
layout: post
title:  "Jekyll arrives"
date:   2014-07-31 15:45:28
categories: site update
---

After developing the original site for a couple of weeks I never found time to
keep it up to date or develop it to where I would have liked.

It's become a graveyard of 5 posts which has been brought back to life by
spammers. The commenting system I had built was a simple threaded series of
posts. No spam protection had been implemented which has lead to someone to
write a wonderful script to write spam comments on the site every so many hours.

**Solution:** store the IP on the next spam and block it. It didn't take long for
another IP to appear spamming. This is going to be a headache isn't it?

So! I've decided to make a bit of an effort to keep the site going. This
definitely does not include cleaning spam and blocking IPs. I want something
easy to maintain, style and manage; which is why I'm dropping vanilla php and
moving onto [Jekyll](http://jekyllrb.com/) and [Disqus](http://disqus.com/).

### ¿Por que?

I don't need anything more than a static site. Jekyll provides allows me to
create static files when needed so there's no need to bash a DB or cache data.
It also integrates very nicely with [github pages](https://pages.github.com/),
wich means free and reliable hosting.

I started paying for a cPanel host with no ssh access a few years ago and to be
honest it's a pain to manage things. [Digital Ocean](http://digitalocean.com)
was going to be my go to hosting services because I have found it to be reliable
and on the cheap side for client projects. But there's no need for that just yet,
this will be the first time I rely on github pages and I'm still curious if I'm
going to feel like I'm missing out.


### The plan

I'm going to:

  * migrate my old blog and work posts to Jekyll
  * implement my old styling, CSS and JS
  * remove comments
  * try to save the contact form

and eventually

  * clean up and refactor css -> sass + js
  * re-check the main styles of the site for basic improvements
  * write posts ;)
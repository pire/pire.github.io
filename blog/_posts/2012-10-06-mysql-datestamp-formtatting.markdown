---
layout: post
title:  "MySQL datestamp formatting"
date:   2012-10-06 15:47:28
categories: site update
---

It's been a little while since I've worked with PHP! Why PHP? I just want to get this simple site out quickly and start using it. I guess in the up n' coming experiments area I'll get to play around with other langs.

I'm happy that PHP allows you to easily format the MySQL datestamp including the ordinal suffix for the day of the month though!

{% highlight php %}
<?= date('F jS, Y', strtotime($entry['date'])); ?> // September 20th, 2012, yay!
{% endhighlight %}
What is Bez?
============
Bez is a small plugin for jQuery which allows you to specify jQuery easing functions as cubic-bezier co-ordinates.

You can see Bez in action in my Roto scrolling plugin: http://github.com/rdallasgray/roto.


SHORT VERSION
-------------
Give Bez an array of cubic-bezier co-ordinates and it returns a jQuery-compatible easing function, like so:

    $("#myElement").animate({ left: -100 }, 500, $.bez([0,0,0.6,1]));


LONG VERSION: Why would I want to do that?
------------------------------------------
Because the new CSS3 transitions use cubic-bezier co-ordinates to create easing functions. 

At present, jQuery.animate doesn't support CSS3 transitions, and CSS3 transitions don't support jQuery easing functions -- so if you want to use transitions in the newer browsers, but allow older ones to fall back to jQuery.animate, and you want to use custom easing, you have to supply BOTH cubic-bezier easing functions AND jQuery-compatible easing functions. Which is a pain.

So Bez allows you to specify ALL your easing functions as cubic-bezier co-ordinates, and automatically converts them to jQuery-compatible easing functions on the fly.


Eh?
---
OK, assume you have an element like this:

    <div id="trans" style="-webkit-transition: left 0.5s ease 0s">Transition demo element</div>

That tells the browser that this element will transition on the css property "left", that the transition will take 0.5s, the easing function will be the default, and there will be 0s delay before the transition. See http://www.w3.org/TR/css3-transitions/.

To make the element slide 100px to the left, all we have to do is set the "left" property. Here's how we do it using jQuery:
    
    $("#trans").css("left", -100);
    
OK. So how about browsers that don't support CSS transitions? We need to do it all in jQuery:

    $("#trans").animate({ left: -100 }, 500);
    
That slides the element 100px to the left with the default "swing" easing function.


So let's introduce non-default easing. In jQuery, there are only two built-in functions: "linear" and "swing". Fine, but not very versatile. The excellent jQuery Easing Plugin (http://gsgd.co.uk/sandbox/jquery/easing/) defines many more, so let's presume we've included that in our code. Now we can say:

    $("#trans").animate({ left: -100 }, 500, "easeOutCubic");

That gives us a nice, smooth, custom easing. So -- how do we apply similar easing to the same animation using CSS3 transitions?

Well, you sort of can't. What you need to do is give an acceptable setting to the "translation-timing-function" CSS property (again see the w3c page on CSS transitions). The "ease-out" setting would be close, but if we want to get more precise, we need to give the setting as cubic-bezier co-ordinates, like so: "transition-timing-function: cubic-bezier(x1, y1, x2, y2);".

The cubic-bezier setting is fairly simple to understand, especially if you've ever used Illustrator or Freehand: you give two sets of co-ordinates -- x1, y1, x2, y2 -- which give the locations of control handles on a bezier curve. These control handles deform the curve, and the curve can be considered as a function. Give the function a number between 0 and 1, defining the percentage complete of the animation, and it outputs another number between 0 and 1, giving the amount of change in the property to be animated. So, for example, a convex curve (like a quarter circle) gives an animation that starts fast and gets slower towards the end. That would be "cubic-bezier(0,0.5,0.5,0)". There's a nice interactive demo at http://www.roblaplaca.com/examples/bezierBuilder/.

So, to change the easing in our CSS3-transition-capable animation, we'd need to do this:

    $("#trans").css("-webkit-translation-timing-function", "cubic-bezier(0,0.5,0.5,0)");
    
That gives us the faster-then-slower animation that I mentioned above. How do we transfer a similar easing to our jQuery.animate animation? Well, again, we sort of can't.

This is where Bez comes in.

Say we have an option bezierEasing, which we can specify as an array of four numbers:

    var bezierEasing = [0, 0.5, 0.5, 0];
    
Then we can do this to make that into a CSS3 timing function:

    var tFunc = "cubic-bezier(" + bezierEasing.join(",") + ")";
    $("#trans").css("-webkit-translation-timing-function", tFunc);
    
We can then fall back to jQuery animate by doing this:

    $("#trans").animate({ left: -100 }, 500, $.bez(bezierEasing));
    
What happened there? We gave Bez our array of cubic-bezier co-ordinates, and it returned a jQuery-compatible easing function. Magic!


Any limitations?
----------------
Cubic-bezier easing as used in CSS3 is not as powerful or versatile as jQuery's easing functions, so you can't really do some of the nice things that the jQuery Easing Plugin does, like bounces.


Acknowledgements
----------------
I am not a mathematician, so I had to do a fair bit of Googling to get the maths (reasonably) right. Big thanks to Nikolay V. Nemshilov for this article: http://st-on-it.blogspot.com/2011/05/calculating-cubic-bezier-function.html.

Also, after I posted this plugin, Janne Aukia got in touch to let me know about his similar plugin, Easie: https://github.com/jaukia/easie. It looks excellent, and uses a direct lift of the Webkit bezier timing code. It's a little larger than Bez, but does a little more.

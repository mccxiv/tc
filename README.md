# Tc, the chat client for twitch

Hi, this is the developer's hideout. <a href="http://mccxiv.github.io/tc/" target="_blank">Click here if you just wanted to download Tc</a>.

Tc is a cross-platform desktop application for chatting on Twitch.tv's servers. 
 
It may look like an IRC client but it uses websockets to establish connections. In general it mimicks the chat found on the official website, but with some useful enhancements.  
You should check the <a href="http://mccxiv.github.io/tc/" target="_blank">download page</a> for more information.

### Technical stuff
Tc is built with html, css, and javascript.  
It uses <a href="http://nwjs.io/" target="_blank">nwjs</a> to run both node.js and a browser environment together.  
Websocket and IRC connections are handled by the <a href="https://github.com/Schmoopiie/tmi.js" target="_blank">tmi.js</a> library.  
The user interface was built with <a href="https://angular.io/" target="_blank">angular</a> and <a href="https://material.angularjs.org/latest/" target="_blank">angular material</a> is used to make it pretty.
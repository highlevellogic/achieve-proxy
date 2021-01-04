<html>
<section style="background-color:LightSkyBlue;">
<a href="https://hll.nu"><img src="https://hll.nu/achieve/skyhigh1.jpg"></a> 
<p>Achieve-proxy is a proxy module for the<a href="https://www.npmjs.com/package/achieve"> Achieve server </a>. This is an early (pre 1.0) 
release. It is stable but some features need more work. This guide will explain set-up and use through a few examples. 
Code for the examples is included with the download. The core concept is to combine achieve based web applications with proxy capabilities on the same server / port. 
Achieve-proxy is not yet capable of proxying to sites that use advanced authentication / authorization, 
such as OIDC, although that is an important goal. List of features below.</p>
<p>The Achieve server was originally built for use by beginning programming students and is extremely easy to use. (Easier than Express) 
It has since been endowed with a variety of professional features, all of which have been implemented with continued concern for efficiency, 
power, and ease of use in an extremely light-weight product. Backend applications are built on Achieve through JavaScript servlets. Achieve-proxy 
uses one or more "proxy servlets" to service one or more 
clients (including itself) to one or more proxied servers. HTTP and HTTPS clients are included in achieve-proxy to support direct access 
to external services from back-end application components.</p>
<p>All features are subject to improvement. Feel free to submit issues.</p>
<p><b>Current features</b>
<ul>
 <li>Flexible many to many proxying</li>
 <li>Web-apps, proxies, external service access on same server:port</li>
 <li>whitelist / blacklist (at least a start - see to do list)</li>
 <li>Customization</li>
 <li>Open CORS</li>
</ul></p>
<p><b>Current To Do List</b>
<ul>
 <li>OIDC to<a href="https://solidproject.org/" target="_blank"> Solid </a>Linked Data Platform</li>
 <li>Refine CORS control</li>
 <li>Refine Whitelist / Blacklist access control</li>
 <li>More customization examples, perhaps turning some into supported features.</li>
</ul></p>
<p><b>Getting Started with Examples</b>
<ul>
 <li><a href="#install">Installation</a></li>
 <li><a href="#setup">Set up examples</a></li>
 <li><a href="#hello1">Hello World! (Browser)</a></li>
 <li><a href="#hello2">Hello World! (Node client)</a></li>
 <li><a href="#wblist">Whitelist / Blacklist</a></li>
 <li><a href="#custom1">Customization (username / password access)</a></li>
 <li><a href="#custom2">Customization (commentary)</a></li>
 <li><a href="#achieve">Backend use with Achieve servlets</a></li>
 <li><a href="#solid">Proxy to Solid</a></li>
</ul></p>
<h3><a id="install">Installation</a></h3>
Select a directory for installing and running <u>the achieve server</u>.
<p><b><pre>           npm i achieve-proxy</pre></b></p>
<p><i>This will install both achieve-proxy and achieve.</i></p>
<h3><a id="setup">Set up</a></h3>
<p>You will find the examples directory in the node_modules achieve-proxy subdirectory. 
Decide where you want your top-level application directory to be. Copy <i>the contents of</i> the examples directory into your chosen app directory.</p>
<p>Move achieveserver.js from the examples directory to the achieve/achieve-proxy install directory. (This is your server start script.)</p>
<p>Edit achieveserver.js. Provide the path to your top-level application directory and set your port. For example:</p>
<p><pre>
                achieve.setAppPath("C:/programs/nodeapps"); // defaults to your server install directory (you can also use "root" - <a href="https://www.npmjs.com/package/achieve">see Achieve documentation</a>)
                const server = achieve.listen(8989);  // http defaults to port 80 (achieve options include https and http2)
</pre></p>
<h3><a id="hello1">Hello World!</a></h3>
<p>Examples include a simple "helloserver" server to use as the target; proxied server: <i>/helloserver.js</i>. 
You can accept running it on port 9898 or (of course) you can edit the file to change it.</p>
<p>Now you can set up the proxy (or simply review). Edit achieveserver.js again. Check to see if the hello proxy has the correct 
target (http:localhost:9898). The property name ('/proxy/hello') is the path to the proxy from your top-level 
app directory. It needs to be quoted because of the slashes. The leading slash is required.</p>
<p><pre>
     let proxy = {
       '/proxy/hello' : {protocol: 'http:', hostname: 'localhost', port: 9898, method: 'get'},
       '/proxy/login' : {protocol: 'http:', hostname: 'localhost', port: 9898, method: 'post'},
       '/proxy/wbcontrol' : {protocol: 'http:', hostname: 'localhost', port: 9898, method: 'get'},
       '/proxy/solid' : {protocol: 'https:', hostname: 'rogerfgay.solid.hll.nu', port: 7443, method: 'post'}
     }
     achieve.setProxy(proxy);
</pre></p>
<p>Achieve is now configured to proxy (with your choice of ports)</p>
<p><pre>           http://localhost:8989/proxy/hello <b>-></b> http://localhost:9898/</pre></p>
<p>Open consoles to your achieve server and helloserver directories. helloserver should be in your top-level app directory at this point. Start each. (<i>node achieveserver</i>
and <i>node helloserver</i>)</p>
<p>Browse http://localhost:8989/proxy/hello/hello.html with the browser console open to watch for errors, 
including specific back-end errors: An Achieve feature. Sends specific error message instead of crashing. This feature is 
very solid with synchronous servlets. If the file isn't found, check your setAppPath setting + /proxy/hello to see if that adds up to the correct path.</p>
<h3><a id="hello2">Hello World! (Node client)</a></h3>
<p>For the second simple example, open another console to the top level application directory. requester.js is a simple http client.
Edit requester.js if you need to change that achieve server port from 8989. Then, with achieveserver and helloserver still 
running, run <i>node requester</i></p>
<p></p>
<h3><a id="wblist">Whitelist / Blacklist</a></h3>
<p><b>Whitelist / blacklist is under development.</b> You are welcome to look at the proxy servlet named wbcontrol.js to see what has already been 
used with some success. The concept is a simple list comparison. More time will be taken to explore, support, test and document options 
for what can / should be compared. The example compares hosts.</p>
<p>See Customization sections below for further thoughts on controlling access.</p>
<p></p>
<h3><a id="custom1">Customization (username / password access)</a></h3>
<p>The examples includes a very simple illustration of customization. The proxy servlet is in [TLD]/proxy/login.js. 
/proxy/login is configured in the Achieve start-up script. (Be sure that it meets your approval.) The login function in the proxy servlet is not a 
supported feature of achieve-proxy. It's intended to point out that you can add your own custom features.</p>
<p>Edit requester.js to use /proxy/login. The script already has a username and password that will be sent in headers.</p>
<p><pre>
  path: '/proxy/login/hello.html',
 // path: '/proxy/hello/hello.html',
</pre></p>
<p>The custom login function in login.js also uses session.proxy.returnError() to handle the response in case of rejection. Note that if you write a 
custom method that handles the response, you need to set session.allowAsync = true. Otherwise, Achieve will also try to handle the response 
(See Achieve documentation to discover why.)</p>
<h3><a id="custom2">Customization (commentary)</a></h3>
<p>Customization and servlets generally (next example) can transform achieve-proxy from a simple pass-through to a flexible and powerful system. 
Access control and load balancing seem obvious examples of features you might want to add or enhance. Above, achieve-proxy is described as a many 
to many proxy. So far, the examples use one proxy-servlet for each target, but one proxy servlet can have more than one target. Note that it is 
only the key (such as '/proxy/hello') that is needed to route a request to a proxy-servlet.</p>
<p>You can create a custom object with any properties that you need - 
so long as you have custom logic in the proxy-servlet to handle it. The object will reach your proxy 
servlet as session.proxyOptions. Properties <i>path</i> and <i>url</i> are automatically set by achieve, but you can modify them 
in your custom handler. 
Your custom handler needs to ensure that session.proxyOptions is set properly before passing session on to proxy.run(session). 
It must then provide the set of options used by 
<a href="https://nodejs.org/api/http.html#http_http_request_options_callback" target="_blank">http(s).request(options)</a>. The proxy configuration 
values in achieveserver.js show the minimum set of values needed (achieve-proxy defaults: get, http, localhost, 80, 443).</a></h3>
<p>You can combine proxy or custom-proxy servlet use with pre and post processing in a non-proxy servlet. Servlets are created with a JavaScript 
file containing: </p>
<p><pre>
          exports.servlet = function (session) {
            // When synchronous with a string response, simply use a return statement
            // Achieve (synchronous) also passes error information back to the client rather than crashing
            // When your code handles the response (required with async), set session.allowAsync=true 
          }
</pre></p>
<p>The URL is formed by using the http path to the JavaScript file <i>without the .js extension</i>. The file itself <i>must have</i> the .js extension. 
There is no need to restart the server when you edit a servlet file. Achieve detects changes and automatically reloads when needed. When using asynchronous 
code in your servlets, you need to set session.allowAsync = true. This will tell Achieve not to handle the http response. For more information on JavaScript 
servlets read the <a href="https://www.npmjs.com/package/achieve" target="_blank">Achieve documentation</a>.</p>
<p></p>
<h3><a id="solid">Proxy to Solid</a></h3>
<p>To say that my work on proxying to a Solid server has met with limited success could very well be an overstatement. I have retrieved public resources from 
Solid, which can be done with an ordinary fetch. Nonetheless, working with Solid provided the motivation to create this module and I have included an 
example that uses solid-auth-client in the browser. Based on expert advice, I will switch to another client app in further efforts.</p>
<p>The example goes directly to the Solid server for login and then attempts to fetch resources. It works for private resources when solid-auth-client 
goes directly to Solid to fetch, but not when going through the proxy where it suffers authorization failure. (Agent is null ...) I spent a good bit of 
time trying to sort this out before deciding on an early release of this module.</p>
<p>The webpage is index.htm in your top-level app directory. URLs indicating idp and path to the solid proxy 
servlet are at the bottom of the script section in index.htm. Modify the proxy configuration in the achieve startup script (achieveserver.js) with 
your own pod address.</p>
<p>If you can provide expert guidance, please open an issue on 
<a href="https://github.com/highlevellogic/achieve-proxy" target="_blank">github</a> or add to 
<a href="https://forum.solidproject.org/t/building-a-node-proxy-solid-auth-client/3683" target="_blank">the topic at the Solid forum</a>.</p>
<p></p>
<h3>Copyright and License</h3>
<p>copyright © 2020, Roger F. Gay, may be freely distributed with the MIT license</p>
<br>
</section>
</html>
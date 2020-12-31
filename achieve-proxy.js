
const _this=this;

exports.run = async function (session) {
  if (session.proxyOptions.hasOwnProperty('good')) { // experimental w. whitelist / blacklist
    if(!session.proxyOptions.good) return;
  } else {
    delete session.proxyOptions.good;
  }
  session.allowAsync = true;
  if (checkProxyOptions(session)) await runProxy(session).catch(e => _this.returnError(session,e.message,e.statusCode));
}

async function runProxy (session) {
  try {
    let req, proxy;
    switch (session.proxyOptions.protocol) {
      case "https:":
        proxy = require('https');
      break;
      case "http2:":
        // proxy = require('http2'); not yet supported
      break;
      default:
        proxy = require('http');
      break;
    }

  //  session.proxyOptions.key = fs.readFileSync('c:/certs_solid/privkey.pem');
  //  session.proxyOptions.cert = fs.readFileSync('c:/certs_solid/fullchain.pem');
    session.proxyOptions.method = session.request.method;
    
    req = proxy.request(session.proxyOptions, function (res) {
      
      if (res.statusCode > 299 && res.statusCode < 310) {
        // needs more work to support or reject redirects to other domains
        console.log("Target computer requested redirect with code: " + res.statusCode + " to " + res.location);
      }
      session.response.headers = res.headers;
      session.response.setHeader('Access-Control-Allow-Headers', '*');
      session.response.setHeader('Access-Control-Allow-Origin', '*');
      session.response.setHeader('Access-Control-Expose-Headers', '*, Authorization');
      session.response.ok = true;
      res.pipe(session.response, { end: true });
    })
    /* experimental
    .on('connect', function (req,res) {
    console.log("************ PROXY CONNECTION ***********");
  })
    */
    .on('error', e => {
      console.log("req on error");
      let msg = "Error contacting " + session.proxyOptions.protocol + "//" + session.proxyOptions.hostname + ":" + session.proxyOptions.port + "/, " + e.message;
      _this.returnError(session,msg,502);
    });
    session.request.pipe(req, { end: true });
 //  })
 //  .on('error', e => console.log(e.stack));   // end connect request
  } catch (e) {
    _this.returnError(session,session.rtErrorMsg(e,"achieve_proxy.js",500));
  }
}
/* for work on refining CORS control
This is how to fix it:
https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS

function withCORS(headers, request) {
  headers['access-control-allow-origin'] = '*';
  if (request.headers['access-control-request-method']) {
    headers['access-control-allow-methods'] = "GET,HEAD,POST";
    delete request.headers['access-control-request-method'];
  }

// headers['Access-Control-Allow-Headers'] = "origin, x-requested-with, content-type, accept";
  if (request.headers['access-control-request-headers']) {
    headers['access-control-allow-headers'] = request.headers['access-control-request-headers'];
    delete request.headers['access-control-request-headers'];
  }
  headers['access-control-expose-headers'] = Object.keys(headers).join(',');

  return headers;
}
  */
function checkProxyOptions (session) {
  if (session.proxyOptions === undefined) session.proxyOptions = {};
  
  if (session.proxyOptions.hasOwnProperty('protocol')) {
    session.proxyOptions.protocol = session.proxyOptions.protocol.toLowerCase();
    if (!session.proxyOptions.protocol.endsWith(':')) session.proxyOptions.protocol += ':';
    if (session.proxyOptions.protocol != "https:" && session.proxyOptions.protocol != "http:") {
      let msg = "Error contacting " + session.proxyOptions.protocol + "//" + session.proxyOptions.hostname + ":" + session.proxyOptions.port + "/, " 
                 + session.proxyOptions.protocol + " is not a supported protocol.";
      console.log(msg);
      _this.returnError(session,msg,505);
      return false;
    }
  } else {
    session.proxyOptions.protocol = "http:";
  }
  
  session.proxyOptions.headers = session.request.headers;
  if (session.request.headers.hasOwnProperty("host")) {
    session.proxyOptions.headers.origin = session.request.headers.host;
    delete session.request.headers.host;
  }
  if (!session.proxyOptions.hasOwnProperty('hostname')) {
    if (session.proxyOptions.hasOwnProperty('host')) {
      session.proxyOptions.hostname = session.proxyOptions.host;
    } else {
      session.proxyOptions.hostname = "localhost";
    }
  }
  if (!session.proxyOptions.hasOwnProperty('method')) {
    session.proxyOptions.method = "get";
  }
  if (!session.proxyOptions.hasOwnProperty('port')) {
    if (session.proxyOptions.protocol == "http:") {
      session.proxyOptions.port = 80;
    } else {
      session.proxyOptions.port = 443;
    }
  }
  return true;
}
function appTrusted (session) {
  if (session.trustedApps) {
    // Not on first release
  }
  return true;
}
let returnError = function (session,msg,code=500) {
  console.log("achieve-proxy returnError: " + msg);
  if (session.response.writableEnded) return;
  session.response.statusCode = code;
  session.response.setHeader("Content-Type", "text/plain");
  session.response.end(msg);
}
exports.returnError = returnError;

exports.accessControl = async function (session,control) { // under development

  if (control == undefined) control=[];  // to become a simple return true -- no control, just run
  
  try {

    let allowList,disallowList,list;
    let host=false,origin=false,referer=false;
    let allow;

    session.allowAsync=true;

    if (Array.isArray(control)) control = { list: control };   
    if (control.type == undefined) control.type = "allow";
    if (control.check == undefined) control.check = "origin";

    switch (control.type.toLowerCase()) {
      case 'allow':
        allow=true;
      break;
      case 'disallow':
        allow=false;
      break;
      default:
        console.log("access control can only be of type 'allow' or 'disallow'. type given was:  " + control.type);
        return false;
    }
    list= control.list;

    console.log("accessControl is running after control check");
    if (!list.length) console.log("WARNING: access control is running with a zero length list.");
/*
host  wu2.hll.nu:8440
origin https://wu2.hll.nu:8440
referer https://wu2.hll.nu:8440/proxy/
*/
    if (session.request.headers.hasOwnProperty("host")) host = session.request.headers.host; // host is required in http 1.1 standard but not http2
    if (session.request.headers.hasOwnProperty("origin")) origin = session.request.headers.origin;  // used with cors and post
    if (session.request.headers.hasOwnProperty("referer")) referer = session.request.headers.referer;  // not always sent
    if (host) {
      domain = host.includes(':') ? host.substring(0,host.indexOf(':')) : host;
    } else if (origin) {
      domain = origin.includes(':') ? origin.substring(0,origin.indexOf(':')) : origin;
      domain = domain.substring(domain.indexOf('//')+1);
    } else if (referer) {
      domain = referer.includes(':') ? referer.substring(0,referer.indexOf(':')) : referer;
      domain = domain.substring(domain.indexOf('//')+1);
      domain = domain.substring(0,domain.indexOf('/'));
    } else {
      console.log("WARNING " + session.proxyOptions.url + "proxy received request with no identifying http1.1 information.");
      errorResponse ("blank",session,"no identifying information");
      session.proxyOptions.good = false;
      return;
    }
    if (!host) {
      if (origin) host = origin.substring(origin.indexOf('//')+1);
    }
console.log("host: " + host + " origin: " + origin + " referer: " + referer + " domain: " + domain);
    if (host) {
      console.log("processing host: " + host);
      if (!session.proxyOptions.protocol) session.proxyOptions.protocol = "http:";
      session.proxyOptions.app = session.proxyOptions.protocol + "//" + session.request.headers.host;
      if (allow == list.includes(session.proxyOptions.app)) {
        session.proxyOptions.good = true;
        return;
      //  session.proxy.run(session);
      } else {
        errorResponse(session);
        session.proxyOptions.good = false;
        return;
      }
    } else {
      errorResponse(session);
      session.proxyOptions.good = false;
      return;
    }
  } catch (e) {
    console.log("error in " + session.proxyOptions.url + " accessControl: " + e.stack);
  }
}
function errorResponse (session,errorMsg=false) {
  let msg;
  if (session.response.writableEnded) return;
  if (errorMsg) {
    console.log("proxy servlet " + session.proxyOptions.url + " " + errorMsg);
    msg = errorMsg;
    returnError(session,msg,500);
  } else {
    console.log(session.proxyOptions.url + " denying access to " + session.proxyOptions.app);
    msg = "Access denied to host " + session.proxyOptions.app;
    returnError(session,msg,403);
  }
}


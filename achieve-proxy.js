
exports.run = function (session) {
  console.log("headers in run: " + JSON.stringify(session.request.headers));
  if (checkProxyOptions(session)) runProxy(session);
  session.allowAsync = true;
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
    req = proxy.request(session.proxyOptions, function (res) {
      if (res.statusCode > 299 && res.statusCode < 310) {
        // needs more work to support or reject redirects to other domains
        console.log("Target computer requested redirect with code: " + res.statusCode + " to " + res.location);
      }
  //    session.response.statusCode = res.statusCode;
  //    session.response.setHeader("Content-Type", res.headers['content-type']);
      session.response.headers = res.headers;
    console.log("res.headers in achieve_proxy: " + JSON.stringify(res.headers));
      res.pipe(session.response, { end: true });
    })
    .on('error', e => {
      console.log("req on error");
      let msg = "Error contacting " + session.proxyOptions.protocol + "//" + session.proxyOptions.hostname + ":" + session.proxyOptions.port + "/, " + e.message;
      returnError(session,msg,502);
    });
    session.request.pipe(req, { end: true });
  } catch (e) {
    if (!session.response.finished) {
      returnError(session,session.rtErrorMsg(e,"achieve_proxy.js",500));
    }
  }
}

function checkProxyOptions (session) {
  if (session.proxyOptions.hasOwnProperty('protocol')) {
    session.proxyOptions.protocol = session.proxyOptions.protocol.toLowerCase();
    if (!session.proxyOptions.protocol.endsWith(':')) session.proxyOptions.protocol += ':';
    if (session.proxyOptions.protocol != "https:" && session.proxyOptions.protocol != "http:") {
      let msg = "Error contacting " + session.proxyOptions.protocol + "//" + session.proxyOptions.hostname + ":" + session.proxyOptions.port + "/, " 
                 + session.proxyOptions.protocol + " is not a supported protocol.";
      console.log(msg);
      returnError(session,msg,505);
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
  
  
  if (!session.proxyOptions.hasOwnProperty('port')) {
    if (session.proxyOptions.protocol == "http:") {
      session.proxyOptions.port = 80;
    } else {
      session.proxyOptions.port = 443;
    }
  }
  return true;
}
function returnError (session,msg,code) {
  console.log(msg);
  session.response.statusCode = code;
  session.response.setHeader("Content-Type", "text/plain; charset=UTF-8");
  session.response.end(msg);
}
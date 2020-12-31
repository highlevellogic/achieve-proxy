const http = require('http');

function helloApp (req,res) {
  try {
  console.log("received request for " + req.url);
  res.setHeader("content-type", "text/plain; charset=UTF-8");
  if (req.url == '/hello.html') {
    console.log(req.url + " found");
    res.statusCode = 200;
    res.end("Hello World!");
  } else {
    console.log("404 file " + req.url + " not found.");
    res.statusCode = 404;
    res.end("404 file " + req.url + " not found. (helloserver only serves '/hello.html'.)");
  }
  } catch (e) {
    console.log(e.message);
  }
}
const port = 9898;
server = http.createServer(helloApp).listen(port);

console.log("helloserver listening on port " + port);
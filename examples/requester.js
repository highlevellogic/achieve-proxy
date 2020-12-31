
let http = require('http');

var options = {
  protocol: "http:",
  hostname: 'wu2.hll.nu',
  port: 8989,
 // path: '/proxy/login/hello.html',
  path: '/proxy/hello/hello.html',
  method: 'post',
  headers: {
    username: "user1",
    pass: 'pass1'
  }
};

var req = http.request(options, function(res) {
console.log(res.statusCode);
  res.on('data', d => {
    console.log("receiving response");
    console.log(JSON.stringify(res.headers));
    console.log(res.headers['content-type']);
    console.log(d.toString());
  })
  .on('error', e => {
    console.log("this is an error: " + e);
  });
});
req.end();
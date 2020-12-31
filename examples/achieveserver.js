const achieve = require('achieve');
const fs = require('fs');

achieve.setAppPath("C:/programs/nodeapps");
/*
const options = {
  key: fs.readFileSync('c:/certs_solid/privkey.pem'),
  cert: fs.readFileSync('c:/certs_solid/fullchain.pem'),
  httpsPort: 8440
};
*/
let proxy = {
  '/proxy/hello' : {protocol: 'http:', hostname: 'localhost', port: 9898, method: 'get'},
  '/proxy/login' : {protocol: 'http:', hostname: 'localhost', port: 9898, method: 'post'},
  '/proxy/wbcontrol' : {protocol: 'http:', hostname: 'localhost', port: 9898, method: 'get'},
  '/proxy/solid' : {protocol: 'https:', hostname: 'rogerfgay.solid.hll.nu', port: 7443, method: 'post'}
}
achieve.setProxy(proxy);

// const sserver = achieve.slisten(options);  // https - must have valid certificate
const server = achieve.listen(8989);


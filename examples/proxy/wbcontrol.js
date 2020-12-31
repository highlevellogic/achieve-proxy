
exports.servlet = function (session) {
  allowList = ["https://www.example.com:8443","https://wu2.hll.nu:8440","http://localhost:8989","http://wu2.hll.nu:8989"];
  disallowList = ["https://www.example.com:8443","https://wu2.hll.nu:8440","https://localhost:8989"];
  let control = {
    type: "allow",  // default: allow
    list: allowList,
    check: "host" // default: "origin"
  };
  if (session.proxy.accessControl(session,control)) {
    console.log("accepted by accessControl");
    session.proxy.run(session);
  } else {
    console.log("rejected by accessControl");
  }
}

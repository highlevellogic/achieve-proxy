
exports.servlet = function (session) {
  session.allowAsync=true;

  if(login(session)) session.proxy.run(session);

}
let users = [];
users.push({username: "user1", pass: "pass1"});
users.push({username: "user2", pass: "pass2"});

function login (session) {
  
  let username = session.request.headers.username;
  let pass = session.request.headers.pass;

  const check = (user) => {
    if (user.username == username) return user.pass == pass;
  }
  
  let result = users.some(check);
  
  if (!result) session.proxy.returnError(session,"Access denied, Unauthorized",401);
  
  return result;
}

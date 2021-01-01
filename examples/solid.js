let session=false;
console.log("solid.js loading");

async function trackSession () {
	solid.auth.trackSession(session => myCallBack(session)).catch(e => output(e));
}
async function login(idp) {
  session = await solid.auth.currentSession();
  if (!session) {
    session = await solid.auth.login(idp);
    if (session) console.log("session exists"); else console.log("no session returned");
  } else {
    alert(`Logged in as ${session.webId}`);
  }
}

async function popupLogin(popupUri) {
  let session = await solid.auth.currentSession();
  if (!session) {
    session = await solid.auth.popupLogin({ popupUri });
    alert (`Logged in as ${session.webId}`);
  }
}
async function fetchFile (url) {
 solid.auth.fetch(url)
	.then(response => response.text())
  .then(result => output(result))
  .catch(e => console.error(e));
}
async function myCallBack (session) {
	if (!session) {
    return await popupLogin();
  } else {
    output(`The user is ${session.webId}`);
	}
}
async function logout () {
  try {
    await solid.auth.logout();
    localStorage.clear();
    session=false;
    output("logged out ");
  } catch (e) {
    output("logout error: " + e);
  }
}
console.log("solid.js loaded");
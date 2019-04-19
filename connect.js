function rtm(message, callback) {
  if (callback) {
    chrome.runtime.sendMessage(chrome.runtime.id, message, callback);
  } else {
    chrome.runtime.sendMessage(chrome.runtime.id, message);
  }
}

function initConnect() {
  document.getElementById('led-list').addEventListener(
      "click",function(e) {
          rtm({
              type: 'connect',
              message: 'Contact [' + e.target.textContent  + '] ...' ,
              target: e.target.id
          });
      });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message) {
    switch (message.type) {
    case 'init-connect':
        initConnect();
        break;
    case 'add-device':
        addDevice(message.did, message.location);
        console.log("device added?");
        break;
    }
  }
});

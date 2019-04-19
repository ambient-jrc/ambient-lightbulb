/*
*   Javascript code for the lightbulb connection/status window
*   Used in connect.html
*/

// Runtime machine for messaging other parts of the chrome app
function rtm(message, callback) {
  if (callback) {
    chrome.runtime.sendMessage(chrome.runtime.id, message, callback);
  } else {
    chrome.runtime.sendMessage(chrome.runtime.id, message);
  }
}

function addDevice(did, location) {
  var devList = document.getElementById('led-list');
  var devItem = document.createElement('li');

  devItem.textContent = did + ' @ ' + location;
  devItem.id = did;
  devList.appendChild(devItem);
}

function initConnect(list) {
  document.getElementById('led-list').addEventListener(
      "click",function(e) {
          rtm({
              type: 'connect',
              message: 'Contact [' + e.target.textContent  + '] ...' ,
              target: e.target.id
          });
          var element = document.getElementById('status');
          element.innerHTML = "Connected to " + e.target.textContent;
      });

  for (let item of list) {
    console.log(item);              // for debugging purposes
    addDevice(item.did, item.loc);  
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message) {
    switch (message.type) {
    case 'init-connect':
        initConnect(message.list);
        break;
    case 'list-device':
        listDevice(message.did, message.location);
        console.log("device listed?");
        break;
    }
  }
});

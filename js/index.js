const deviceList = [];

// Runtime machine for messaging other parts of the chrome app
function rtm(message, callback) {
  if (callback) {
    chrome.runtime.sendMessage(chrome.runtime.id, message, callback);
  } else {
    chrome.runtime.sendMessage(chrome.runtime.id, message);
  }
}

function onInitConnect(appWindow) {
    appWindow.show();
    var document = appWindow.contentWindow.document;
    document.addEventListener('DOMContentLoaded', function () {
        rtm({
                type: 'init-connect',
                list: deviceList,       // list of devices found
            });
    });
}

function listDevice(did, loc) {
  let device = {did: did, loc: loc};
  deviceList.push(device);
}

// Bind the functions to the buttons
function init() {

  var closeBox = document.getElementById('close');
  closeBox.onclick = function () {
      chrome.app.window.current().close();
  };

  let powerButton = document.getElementById('power-button');
  powerButton.onclick = function() {
      togglePower();
  };

  let tempButton = document.getElementById('temp-button');
  tempButton.onclick = function() {
    getTemp(function(temp) {
    // anonymous callback function
    try {let obj = JSON.parse(temp);
    tempBrightness(convertTemp(obj.main.temp));
    } catch(error) {
      console.log("error");
    }
    });
  }

  // for debugging the temperature functions
  // able to enter your own temperature value
  let tempDebug = document.getElementById('temp-debug');
  let tempInput = document.getElementById('temp-input');
  tempDebug.onclick = function() {
    tempBrightness(parseInt(tempInput.value));
  }


  let sleepFive = document.getElementById('sleep-5');
  sleepFive.onclick = function() {
    yeelight_sleep_five();
  };

  let sleepThirty = document.getElementById('sleep-30');
  sleepThirty.onclick = function() {
    yeelight_sleep_thirty();
  };

  let newWindow = document.getElementById('new-window');
  newWindow.onclick = () => {
    chrome.app.window.create('connect.html', {
      id: 'connect-window',
      minHeight: 300,
      minWidth: 200,
      bounds: {
        height: 400,
        width: 300
      }
    }, onInitConnect);
  };
};


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message) {
    switch (message.type) {
    case 'init':
        init();
        break;
    case 'info':
        console.log(message);
        break;
    case 'add-device':
        listDevice(message.did, message.location);
        console.log("device added?");
        break;
    }
  }
});

// leaflet js

var mymap = L.map('mapid').setView([51.05, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);
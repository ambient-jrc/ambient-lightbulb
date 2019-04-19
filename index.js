const deviceList = [];

function rtm(message, callback) {
  if (callback) {
    chrome.runtime.sendMessage(chrome.runtime.id, message, callback);
  } else {
    chrome.runtime.sendMessage(chrome.runtime.id, message);
  }
}

// function addDevice(did, location) {
//   var devList = document.getElementById('led-list');
//   var devItem = document.createElement('li');

//   devItem.textContent = did + ' @ ' + location;
//   devItem.id = did;
//   devList.appendChild(devItem);
// }

function sendMessage() {
  var messageInputBox = document.getElementById('input-box');
  var message = messageInputBox.value;
  rtm({
    type: 'request',
    message: message
  });
  messageInputBox.value = '';
}

// toggles the power of the lightbulb when called
function togglePower() {
  let message = '{"id":1,"method":"toggle","params":[]}'
  rtm({
    type: 'request',
    message: message
  });
}

// changes the color temperature of the lightbulb based on the temperature
function tempBrightness(temp) {
//turn the power on, if already on, this will not turn it off
//Needed because 'set_bright' only works if the bulb is on
  let message;
  if (temp < 65) {
    message = '{"id":1,"method":"set_ct_abx","params":[6500, "smooth", 500]}';
    rtm({
      type: 'request',
      message: message
    });
  } else if (temp > 75) {
    message = '{"id":1,"method":"set_ct_abx","params":[2700, "smooth", 500]}';
    rtm({
      type: 'request',
      message: message
    });  
  } else {
    message = '{"id":1,"method":"set_ct_abx","params":[3500, "smooth", 500]}';
    rtm({
      type: 'request',
      message: message
    });  
  }
}

// fetches a JSON from openweathermap.org based on the location given and
// returns it to the callback function for it to use
// API's temperatures are in kelvin
function getTemp(callback) {
    const http = new XMLHttpRequest();
    const url = "https://api.openweathermap.org/data/2.5/weather?q=Honolulu,usa&APPID=c4cba4191bf19aa590a4e6d7c6edb208";
    http.open("GET", url);
    http.send();

    http.onreadystatechange = (e) => {       
      callback(http.responseText);
    }
}

// function to convert an integer from kelvin to fahrenheit
// formula: (K − 273.15) × 9/5 + 32 = °F
function convertTemp(kelvin) {
  let fahr = ((kelvin - 273.15) * (9 / 5)) + 32;
  console.log(kelvin);
  console.log(fahr);
  return fahr;
}

function yeelight_sleep_off(){
  var message = '{"id":1,"method":"set_power","params":["off", "smooth", 500]}';
  rtm({
    type: 'request',
    message: message
  });
}

function yeelight_sleep_on(){
  var message = '{"id":1,"method":"set_power","params":["on", "smooth", 500]}';
  rtm({
    type: 'request',
    message: message
  });
}

// timed event functions
// call given function after a given time
// setTimeout uses function references instead of function calls
function yeelight_sleep_thirty(){
  setTimeout(yeelight_sleep_off, 30000);
}
function yeelight_sleep_five(){
  setTimeout(yeelight_sleep_off, 5000);
}

function init() {
    // let messageInputBox = document.getElementById('input-box');
    // messageInputBox.addEventListener('keydown', function (e) {
    //     if (e.keyCode == 13) {
    //         sendMessage();
    //     }
    // });

  // follow this pattern for buttons
  var closeBox = document.getElementById('close');
  closeBox.onclick = function () {
      chrome.app.window.current().close();
  };

  // for when the on/off button gets clicked
  let powerButton = document.getElementById('power-button');
  powerButton.onclick = function() {
      togglePower();
  };

  // for changing to temperature mode
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

  // For creating the connect-lightbulb window
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

  // for the sleep buttons
  let sleepFive = document.getElementById('sleep-5');
  sleepFive.onclick = function() {
    yeelight_sleep_five();
  };

  let sleepThirty = document.getElementById('sleep-30');
  sleepThirty.onclick = function() {
    yeelight_sleep_thirty();
  };
};

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

function addDevice(did, loc) {
  let device = {did: did, loc: loc};
  deviceList.push(device);
}

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
        addDevice(message.did, message.location);
        console.log("device added?");
        break;
    }
  }
});

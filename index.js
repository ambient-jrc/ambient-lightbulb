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
  var message = '{"id":0,"method":"set_power","params":["off", "smooth"]}';
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

function yeelight_sleep_thirty(){
  setTimeout(yeelight_sleep(), 30000);
}
function yeelight_sleep_five(){
  setTimeout(yeelight_sleep(), 5000);
}

function init() {
    let messageInputBox = document.getElementById('input-box');
    messageInputBox.addEventListener('keydown', function (e) {
        if (e.keyCode == 13) {
            sendMessage();
        }
    });

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
    let obj = JSON.parse(temp);
    tempBrightness(convertTemp(obj.main.temp));
    });
  }

  let tempDebug = document.getElementById('temp-debug');
  let tempInput = document.getElementById('temp-input');
  tempDebug.onclick = function() {
    tempBrightness(parseInt(tempInput.value));
  }

  var splitter = document.getElementById('splitter');
  chrome.storage.local.get('input-panel-size', function (obj) {
    if (obj['input-panel-size']) {
      var inputPanel = document.getElementById('input-panel');
      inputPanel.style.height = obj['input-panel-size'] + 1 + 'px';
    }
  });
  splitter.onmousedown = function (e) {
    if (e.button != 0) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    var inputPanel = document.getElementById('input-panel');
    var totalHeight = document.body.scrollHeight;
    var panelHeight = inputPanel.scrollHeight;
    var startY = e.pageY;
    var MouseMove;
    document.addEventListener('mousemove', MouseMove = function (e) {
      e.stopPropagation();
      e.preventDefault();
      var dy = e.pageY - startY;
      if (panelHeight - dy < 120) {
        dy = panelHeight - 120;
      }
      if (totalHeight - panelHeight + dy < 120) {
        dy = 120 - totalHeight + panelHeight;
      }
      inputPanel.style.height = panelHeight - dy + 1 + 'px';
      chrome.storage.local.set({'input-panel-size': panelHeight - dy});
    });
      document.addEventListener('mouseup', function MouseUp(e) {
          MouseMove(e);
          document.removeEventListener('mousemove', MouseMove);
          document.removeEventListener('mouseup', MouseUp);
    });
  };

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
  var newMessageLi;
  var messages = document.getElementById('messages');
  if (message) {
    switch (message.type) {
    case 'init':
        init();
        break;
    case 'add-device':
        addDevice(message.did, message.location);
        break;
    case 'info':
        newMessageLi = document.createElement('li');
        newMessageLi.textContent = message.message;
        newMessageLi.setAttribute("class", message.level);
        messages.appendChild(newMessageLi);
        break;
    }
  }
});

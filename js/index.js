const deviceList = [];
// For reqeusting data from openweathermap
const appID = config.API_KEY;
const locations = [
  {
    id: "5856195",
    name: "Honolulu",
    pos: {
      x: 470,
      y: 487
    }
  },   // honolulu
  {
    id: "5853992",
    name: "Wahiawa",
    pos: {
      x: 295,
      y: 265 
    }
  },   // Wahiawa
  { 
    id: "5856194",
    name: "Kapolei",
    pos: {
      x: 259,
      y: 419 
    }

  },    // Kapolei
  { id: "5847486",
    name: "Kailua",
    pos: {
      x: 528,
      y: 370 
    }

  },     // Kailua
  {
    id: "5852824",
    name: "Pupukea",
    pos: {
      x: 259,
      y: 99 
    }

  },    // Pupukea
  { 
    id: "5850511",
    name: "Makaha",
    pos: {
      x: 88,
      y: 289 
    }

  }     // Makaha
];    

function createMarkers(locations) {
  var background = document.getElementById('background-container');

  for (let loc of locations) {
    let marker = document.createElement('button');
    marker.textContent = loc.name; 
    marker.id = loc.id;
    marker.style.top = loc.pos.y +  "px";
    marker.style.left = loc.pos.x + "px";
    marker.style.position = "absolute";
    background.appendChild(marker);
  }
}


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

function findMousePos(event) {
  const mousePos = {
    x: event.clientX,
    y: event.clientY
  };
  console.log(mousePos);
}

// Bind the functions to the buttons
function init() {
 
  retrieveWeather(locations);
  
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
      try {
        let obj = JSON.parse(temp);
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

  createMarkers(locations);

  document.addEventListener("click", findMousePos);
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

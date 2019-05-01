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
      x: 500,
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
//make images

let clouds = document.createElement('image');
clouds.style.width = '30px';
clouds.style.height = '30px';
clouds.style.zIndex = '10';
clouds.style.url = '/assets/clouds.jpg';

function createMarkers(locations) {
  var background = document.getElementById('background-container');

  for (let loc of locations) {
    let marker = document.createElement('div');
    let button = document.createElement('div');
    let label = document.createElement('a');

    marker.className = "ui labeled button";
    button.className = "ui tiny secondary button";
    label.className = "ui left pointing orange label";

    button.textContent = loc.name; 
    marker.id = loc.id;
    marker.style.top = loc.pos.y +  "px";
    marker.style.left = loc.pos.x + "px";
    marker.style.position = "absolute";
    marker.appendChild(button);
    marker.appendChild(label);
    background.appendChild(marker);
  }
}


function updateMarker(loc) {
  var background = document.getElementById('background-container');
  let marker = document.getElementById(loc.id);
  let label = marker.children[1]
 // let conditions = loc.weather.weather[0].main;
//console.log(conditions);

  label.textContent = convertTemp(loc.weather.main.temp) + "ºF";
  if (loc.weather.weather[0].main == "Clouds") {
    console.log(loc);
    console.log(label);
    console.log(marker);
    console.log(marker.children[1]);
    marker.children[2] = clouds;
    console.log(marker.children[2]);
   // let img = document.createElement('image');
   // marker.children[2].appendChild(clouds);
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
 
  createMarkers(locations);
  retrieveWeather(locations);
  
  var closeBox = document.getElementById('close');
  closeBox.onclick = function () {
      chrome.app.window.current().close();
  };

  let powerButton = document.getElementById('power-button');
  powerButton.onclick = function() {
      togglePower();
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

  // createMarkers(locations);
  for(let x = 0; x<locations.length; x++) {
    let clickable = document.getElementById(locations[x].id);
    clickable.onclick = function() {
      let forecast = locations[x].weather.weather[0].main;
      if (forecast == "Rain") {
        console.log("rain");
      } else if(forecast == "Clouds") {
        console.log("clouds");
      } else if(forecast == "Clear") {
        console.log("clear");
      } else if(forecast == "Thunderstorm") {
        console.log("thunderstorm");
      } else if(forecast == "Drizzle") {
        console.log("drizzle");
      }
    }
  }

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
        console.log("device added");
        break;
    }
  }
});

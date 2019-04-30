// Temperature.js
// For functions related to manipulating the lightbulb
// as well as for sending messages to the lightbulb
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
function getTemp(locID, appID, callback) {
    const http = new XMLHttpRequest();
    const url = "https://api.openweathermap.org/data/2.5/weather?id=" + locID + "&APPID=" + appID;
    http.open("GET", url);
    http.send();

    http.onreadystatechange = (e) => {       
      callback(http.responseText);
    }
}

function retrieveWeather(locations) {
  for (let loc of locations) {
    getTemp(loc.id, appID, (temp) => {
      try {
        let obj = JSON.parse(temp);
        loc.weather = obj;
        updateMarker(loc);
      } catch(error) {
        console.log(error);
      }
    });
  }
}

// function to convert an integer from kelvin to fahrenheit
// formula: (K − 273.15) × 9/5 + 32 = °F
function convertTemp(kelvin) {
  let fahr = ((kelvin - 273.15) * (9 / 5)) + 32;
  fahr = fahr.toFixed(2);
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


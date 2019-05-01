const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=";
const currentURL = "https://api.openweathermap.org/data/2.5/weather?id=";
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

// fetches a JSON from openweathermap.org based on the location given and
// returns it to the callback function for it to use
// API's temperatures are in kelvin
function getTemp(type, locID, appID, callback) {
    const http = new XMLHttpRequest();
    const url = type + locID + "&APPID=" + appID;
    http.open("GET", url);
    http.send();

    http.onreadystatechange = (e) => {       
      callback(http.responseText);
    }
}

function retrieveWeather(locations) {
  for (let loc of locations) {
    getTemp(currentURL, loc.id, appID, (temp) => {
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

function retrieveForecast(locations) {
  for (let loc of locations) {
    getTemp(forecastURL, loc.id, appID, (temp) => {
      try {
        let obj = JSON.parse(temp);
        loc.forecast = obj;
      } catch(error) {
        console.log(error);
      }
    });
  }
}

// return a brightness value based on the weather
function getBrightness(weather) {
  let brightness = "";

  switch(weather) {
    case "Clouds":
      brightness = "35";
      break;
    case "Rain":
      brightness = "20";
      break
    case "Thunderstorm":
      brightness = "15";
      break;
    case "Drizzle":
      brightness = "30";
      icon = "wi wi-showers";
      break;
    default:
      brightness = "50";
  }

  return brightness;
}

// changes the color temperature of the lightbulb based on the temperature
function getColorTemp(temp) {
//turn the power on, if already on, this will not turn it off
//Needed because 'set_bright' only works if the bulb is on
  let message;
  if (temp < 65) {
    return "2700";
  } else if (temp > 85) {
    return "6500";
  } else {
    return "" + (6500 - 190 * (temp - 65));
  }
}


// function to convert an integer from kelvin to fahrenheit
// formula: (K − 273.15) × 9/5 + 32 = °F
function convertTemp(kelvin) {
  let fahr = ((kelvin - 273.15) * (9 / 5)) + 32;
  fahr = fahr.toFixed(2);
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


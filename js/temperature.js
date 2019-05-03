
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

// Given an array of locations, append each with a weather object
// queried from openweathermap
function retrieveWeather(locations) {
  for (let loc of locations) {
    getTemp(currentURL, loc.id, appID, (temp) => {
      try {
        let obj = JSON.parse(temp);
        loc.weather = obj;
        updateMarker(loc.weather.main.temp, loc.weather.weather[0].main, loc.id);
      } catch(error) {
        console.log(error);
      }
    });
  }
}

// Given an array of locations, append each with a forecast object
// queried from openweathermap
function retrieveForecast(locations, callback) {
  for (let loc of locations) {
    getTemp(forecastURL, loc.id, appID, (temp) => {
      try {
        let obj = JSON.parse(temp);
        loc.forecast = obj;
        callback();
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
  if (temp < LOW_TEMP) {
    return "2700";
  } else if (temp > HIGH_TEMP) {
    return "6500";
  } else {
    let increment = ((6500 - 2700) / (HIGH_TEMP - LOW_TEMP)) || 1;
    return "" + (6500 - increment * (temp - LOW_TEMP));
  }
}

// gets appropriate value for the temperature given
// returns a number between the limits low and high
function getColorValue(temp, low, high) {
  // make sure that the temperature doesn't fall out of bounds  
  temp = (temp < LOW_TEMP) ? LOW_TEMP : temp;
  temp = (temp > HIGH_TEMP) ? HIGH_TEMP : temp;
  // the (|| 1) is to make sure divisor is not 0
  let divisor = (HIGH_TEMP - LOW_TEMP) || 1;
  let color = low + (temp - LOW_TEMP) * ((high - low) / divisor);
  
  return color;
}

// given a temperature, returns an array with the appropriate
// RGB values
function tempRGB(temp) {
  const rgb = [];
  let low, high;
  if (temp < MID_TEMP) {
    low = coldRGB.slice();
    high = midRGB.slice();
  } else {
    low = midRGB.slice();
    high = warmRGB.slice();
  }
  for (let i = 0; i < 3; i++) {
    rgb.push(Math.floor(getColorValue(temp, low[i], high[i])));
  }
  return rgb;
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


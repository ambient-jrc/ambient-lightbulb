// file where we keep the constant values
const appID = config.API_KEY;
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=";
const currentURL = "https://api.openweathermap.org/data/2.5/weather?id=";
const LOW_TEMP = 75;
const HIGH_TEMP = 85;
const MID_TEMP = (LOW_TEMP + HIGH_TEMP) * .5
const coldRGB = [135, 206, 250];
const warmRGB = [255, 165, 0];
const midRGB = [255, 255, 255];
const locations = [
  {
    id: "5856195",
    name: "Honolulu",
    pos: {
      x: 450,
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
      x: 450,
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

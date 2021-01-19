'use strict';
// ===== packages =====//
const express = require('express');

const cors = require('cors');
const { response } = require('express');

require('dotenv').config();


// ===== setup the app =====//
const app = express();

app.use(cors());

// ===== other global variables =====//
const PORT = process.env.PORT || 3001;

// ===== Routes =====//

app.get('/location', (req, res) => {
  if (req.query.city === '') {
    res.status(500).send('Sorry, something went wrong');
    return;
  }

  const theDataArrayFromTheLocationJson = require('./data/location.json');
  const theDataObjFromJson = theDataArrayFromTheLocationJson[0];

  console.log('req.query', req.query);
  const searchedCity = req.query.city;


  const newLocation = new Location(
    searchedCity,
    theDataObjFromJson.display_name,
    theDataObjFromJson.lat,
    theDataObjFromJson.lon
  );


  res.send(newLocation);
});

app.get('/weather', (req, res) => {
  const theDataArrayFromTheWeatherJson = require('./data/weather.json');
  const theDataObjFromWeatherJson = theDataArrayFromTheWeatherJson.data;
  // const allWeather = [];
  console.log(theDataObjFromWeatherJson);
  const allWeather = theDataObjFromWeatherJson.map((val) => {
    return new Weather(val.weather.description, val.datetime);
    // const weather = new Weather(jsonObj.weather.description, jsonObj.datetime);
    // allWeather.push(weather);
  });
  console.log(allWeather);
  res.send(allWeather);
});

// ===== start the server =====//
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));


// ===== Helper Functions =====//

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.longitude = longitude;
  this.latitude = latitude;
}

function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = time;
}

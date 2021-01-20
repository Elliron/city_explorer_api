'use strict';
// ===== packages =====//
const express = require('express');
const cors = require('cors');
const { response } = require('express');
require('dotenv').config();
const superagent = require('superagent');

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
  const searchedCity = req.query.city;
  const key = process.env.GEOCODE_API_KEY;
  // const theDataArrayFromTheLocationJson = require('./data/location.json');
  // const theDataObjFromJson = theDataArrayFromTheLocationJson[0];
  console.log('req.query', req.query);
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;
  superagent.get(url)
    .then(result => {
      // console.log(result.body);
      const theDataObjFromJson = result.body[0];
      const newLocation = new Location(
        searchedCity,
        theDataObjFromJson.display_name,
        theDataObjFromJson.lat,
        theDataObjFromJson.lon
      );
      res.send(newLocation);
    })
    .catch(error => {
      res.status(500).send('locationiq failed');
      console.log(error.message);
    });
});

app.get('/weather', (req, res) => {
  const theDataArrayFromTheWeatherJson = require('./data/weather.json');
  const theDataObjFromWeatherJson = theDataArrayFromTheWeatherJson.data;
  // const allWeather = [];
  // console.log(theDataObjFromWeatherJson);
  const allWeather = theDataObjFromWeatherJson.map((val) => {
    return new Weather(val.weather.description, val.datetime);
    // const weather = new Weather(jsonObj.weather.description, jsonObj.datetime);
    // allWeather.push(weather);
  });
  // console.log(allWeather);
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

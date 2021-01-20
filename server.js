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
  // console.log('req.query', req.query);
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
  const key = process.env.WEATHER_API_KEY;
  const searchedCity = req.query.search_query;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${searchedCity}&key=${key}`;
  superagent.get(url)
    .then(result => {
      // console.log(result.body.data);
      const theDataObjFromWeatherJson = result.body.data;
      // console.log(theDataObjFromWeatherJson);
      const allWeather = theDataObjFromWeatherJson.map((val) => {
        return new Weather(val.weather.description, val.datetime);

      });
      // console.log('I am a note', allWeather);
      res.send(allWeather);
    });
});

app.get('/trail', (req, res) => {
  const key = process.env.TRAIL_API_KEY;
  const searchedCity = req.query.search_query;
  console.log('city', req);
  const url = `https://developer.nps.gov/api/v1/parks?parkCode=${searchedCity}&api_key=${key}`;
  superagent.get(url)
    .then(result => {
      console.log('yay', result.body.data);
      // const theDataObjFromTrailJson = result.body[0];
      // console.log(theDataObjFromWeatherJson);
      // const allTrail = theDataObjFromTrailJson.map((val) => {
      //   return new Trail(val.name, val.datetime);

    });
  // console.log('I am a note', allWeather);
  // res.send(allTrail);
  // });
});
// const theDataArrayFromTheWeatherJson = require('./data/weather.json');
// const theDataObjFromWeatherJson = theDataArrayFromTheWeatherJson.data;
// const allWeather = [];
// console.log(theDataObjFromWeatherJson);
// const weather = new Weather(jsonObj.weather.description, jsonObj.datetime);
// allWeather.push(weather);
// console.log(allWeather);

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

// function Trail(name, location, trail_url) {
//   this.name = name;
//   this.location = location;
//   this.trail_url = trail_url;
// }

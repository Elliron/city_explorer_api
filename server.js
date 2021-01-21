'use strict';
// ===== packages =====//

const express = require('express');
const cors = require('cors');
const { response } = require('express');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');

// ===== setup the app =====//

const app = express();
app.use(cors());
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', (error) => console.log(error));

// ===== other global variables =====//

const PORT = process.env.PORT || 3001;

// ===== Routes =====//

app.get('/', (req, res) => {
  res.send('It/s alive, ALLLLIIIIVVVEEEE');
});

app.get('/location', (req, res) => {
  // const sqlQuery = "SELECT * FROM location";
  // client.query(sqlQuery)
  //   .then(result => {
  //     console.log(result.Potato.rows);
  //     res.send(result.Potato.rows);
  //   });


  if (req.query.city === '') {
    res.status(500).send('Sorry, something went wrong');
    return;
  }
  const searchedCity = req.query.city;
  const key = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;
  superagent.get(url)
    .then(result => {
      const theDataFromObjLocation = result.body[0];
      const newLocation = new Location(
        searchedCity,
        theDataFromObjLocation.display_name,
        theDataFromObjLocation.lat,
        theDataFromObjLocation.lon
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
  const latitude = latitude;
  const longitude = longitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${searchedCity}&key=${key}&days=8&${longitude}&${latitude}`;
  superagent.get(url)
    .then(result => {
      const theDataObjFromWeatherJson = result.body.data;
      const allWeather = theDataObjFromWeatherJson.map((val) => {
        return new Weather(val.weather.description, val.datetime);
      });
      res.send(allWeather);
    })
    .catch(error => {
      res.status(500).send('weawtherbit failed');
      console.log(error.message);
    });
});

app.get('/parks', (req, res) => {
  const key = process.env.PARK_API_KEY;
  const searchedCity = req.query.search_query;
  const url = `https://developer.nps.gov/api/v1/parks?q=${searchedCity}&api_key=${key}&limit=5`;
  superagent.get(url)
    .then(result => {
      const parkInfo = result.body.data.map(obj => {
        const newParkObj = new Park(obj);
        console.log('thing', newParkObj);
        return newParkObj;
      });
      res.send(parkInfo);
    })
    .catch(error => {
      res.status(500).send('parks failed');
      console.log(error.message);
    });
});

// ===== start the server =====//

client.connect();

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

function Park(obj) {
  this.name = obj.name;
  this.address = `${obj.addresses[0].line1} ${obj.addresses[0].city}, ${obj.addresses[0].stateCode} ${obj.addresses[0].postalCode}`;
  this.fee = obj.entranceFees[0].cost;
  this.description = obj.description;
  this.url = obj.url;
}

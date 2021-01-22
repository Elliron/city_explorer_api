'use strict';
// ===== packages =====//

const express = require('express');
const cors = require('cors');
const { response, request } = require('express');
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
  res.send('Its alive, ALLLLIIIIVVVEEEE');
});

app.get('/location', (req, res) => {
  const searchedCity = req.query.city;
  const key = process.env.GEOCODE_API_KEY;
  const sqlQuery = 'SELECT * FROM location WHERE search_query=$1';
  const sqlArray = [searchedCity];
  client.query(sqlQuery, sqlArray)
    .then(result => {
      console.log('hiya', result.rows);
      if (result.rows.length !== 0) {
        res.send(result.rows[0]);
      } else {
        if (req.query.city === '') {
          res.status(500).send('Sorry, something went wrong');
          return;
        }
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;
        superagent.get(url)
          .then(result => {
            const theDataFromObjLocation = result.body[0];
            const newLocation = new Location(searchedCity, theDataFromObjLocation);
            const sqlQuery = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)';
            console.log(newLocation);
            const sqlArray = [newLocation.search_query, newLocation.formatted_query, newLocation.latitude, newLocation.longitude];
            client.query(sqlQuery, sqlArray);
            // searchedCity,
            // theDataFromObjLocation.display_name,
            // theDataFromObjLocation.lat,
            // theDataFromObjLocation.lon
            res.send(newLocation);
          })
          .catch(error => {
            res.status(500).send('locationiq failed');
            console.log(error.message);
          });
      }
    });
});

app.get('/weather', (req, res) => {
  const key = process.env.WEATHER_API_KEY;
  const searchedCity = req.query.search_query;
  // const latitude = latitude;
  // const longitude = longitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${searchedCity}&key=${key}&days=8`;
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
        return newParkObj;
      });
      res.send(parkInfo);
    })
    .catch(error => {
      res.status(500).send('parks failed');
      console.log(error.message);
    });
});

app.get('/movies', (req, res) => {
  const key = process.env.MOVIE_API_KEY;
  const searchedCity = req.query.search_query;
  const url = `https://api.themoviedb.org/3/movie/550?api_key=${key}&language=en-US&query=&${searchedCity}`;
  superagent.get(url)
    .then(result => {
      // console.log(result.body);
      const movieArray = result.body.results.map(movieObj => new Movie(movieObj));
      res.send(movieArray);
    })
    .catch(error => {
      res.status(500).send('Movies failed');
      console.log(error.message);
    });

});
// ===== start the server =====//

client.connect();

app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));

// ===== Helper Functions =====//

function Location(search_query, obj) {
  this.search_query = search_query;
  this.formatted_query = obj.display_name;
  this.longitude = obj.lon;
  this.latitude = obj.lat;
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

function Movie(obj) {
  this.title = obj.original_title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

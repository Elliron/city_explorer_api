'use strict';
// packages
const express = require('express');

const cors = require('cors');
const { response } = require('express');

require('dotenv').config();


// setup the app
const app = express();

app.use(cors());

// other global variables
const PORT = process.env.PORT || 3001;

// Routes
// app.get('/', (request, response) => {
//   response.send('you made it home');
// });

// //localhost:3000/pet-the-pet?name=ginger&quantity=3&lastName=clark
// app.get('/pet-the-pet', (req, res) => {
//   console.log(req.query.name);
//   res.send('about to pet the pet');
// });

app.get('/location', (req, res) => {
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
// start the server
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));


// Helper Functions

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.longitude = longitude;
  this.latitude = latitude;
}


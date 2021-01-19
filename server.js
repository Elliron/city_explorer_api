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
app.get('/', (request, response) => {
  response.send('you made it home');
});

//localhost:3000/pet-the-pet?name=ginger&quantity=3&lastName=clark
app.get('/pet-the-pet', (req, res) => {
  console.log(req.query.name);
  res.send('about to pet the pet');
});

// start the server
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));

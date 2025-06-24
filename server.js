const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodeFetch = require('node-fetch');

// database
const db = require('./db');

// import controllers
const root = require('./controllers/root');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const clarifai = require('./controllers/clarifai');
const profile = require('./controllers/profile');
const image = require('./controllers/image');


const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// === GET Requests ===
app.get('/', (req, res) => { root.handleRoot(req, res, db) });
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) });

// === POST Requests ===
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) });
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });
app.post('/clarifai', (req, res) => { clarifai.handleClarifai(req, res, nodeFetch) });

// === PUT Requests ===
app.put('/image', (req, res) => { image.handleImage(req, res, db) });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

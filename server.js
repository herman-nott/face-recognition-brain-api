const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodeFetch = require('node-fetch');
const db = require('./db');

const app = express();
const PORT = 3000;

const CLARIFAI_MODEL_ID = 'face-detection';
const USER_ID = 'clarifai';
const APP_ID = 'main';
const CLARIFAI_API_URL = `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`;
const CLARIFAI_API_KEY = '8789603313e74fc3b516d12617ae12fe';


app.use(bodyParser.json());
app.use(cors());


// === GET Requests ===
app.get('/', async (req, res) => {
    try {
        const users = await db.select('*').from('users');
        res.json(users);
    } catch (err) {
        res.status(500).json('Server error');
    }
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;

    db.select('*').from('users').where({ id: id })
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json("Not found. Error getting user")
            }
        });
});

// === POST Requests ===
app.post('/signin', (req, res) => {
    db.select('username', 'email', 'hash').from('login')
        .where(function () {
            this.where('email', '=', req.body.emailOrUsername)
                .orWhere('username', '=', req.body.emailOrUsername);
        })
        .then(async data => {
            try {
                const isValid = await bcrypt.compare(req.body.password, data[0].hash);

                if (isValid) {
                    return db.select('*').from('users')
                        .where(function () {
                            this.where('email', '=', req.body.emailOrUsername)
                                .orWhere('username', '=', req.body.emailOrUsername);
                        })
                        .then(user => {
                            res.json(user[0]);
                        })
                        .catch(err => res.status(400).json('Unable to get a user'));
                } else {
                    res.status(400).json('Wrong credentials');
                }
            } catch (error) {
                res.status(500).json('Server error');
            }
        })
        .catch(err => res.status(400).json('Wrong credentials'));
});

app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email,
            username: username
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    username: username,
                    email: loginEmail[0].email,
                    joined: new Date()
                })
                .then(user => {
                    res.json(user[0]);
                });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err => res.status(400).json('Unable to register'))
});

app.post('/clarifai', async (req, res) => {
    const { imageUrl } = req.body;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": imageUrl
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Key ${CLARIFAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: raw
    };

    try {
        const response = await nodeFetch(CLARIFAI_API_URL, requestOptions);
        const data = await response.json();
        if (response.ok) {
            res.json(data);
        } else {
            console.error('Clarifai API error:', data);
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Clarifai request failed', details: error.message });
    }
});


// === PUT Requests ===
app.put('/image', (req, res) => {
    const { id } = req.body;

    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries);  
        })
        .catch(err => res.status(400).json('Unable to get entries'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

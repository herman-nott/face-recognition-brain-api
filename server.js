const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodeFetch = require('node-fetch');

const app = express();
const PORT = 3000;

let database = {
    users: [
        {
            id: '1',
            username: 'john',
            email: 'john@gmail.com',
            password: 'pass',
            entries: 0,
            joined: new Date()
        },
        {
            id: '2',
            username: 'sam_smith',
            email: 'ss@gmail.com',
            password: '1234',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '789',
            hash: '',
            email: 'aaa@gmail.com'
        }
    ]
};

const CLARIFAI_MODEL_ID = 'face-detection';
const USER_ID = 'clarifai';
const APP_ID = 'main';
const CLARIFAI_API_URL = `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`;
const CLARIFAI_API_KEY = '8789603313e74fc3b516d12617ae12fe';


app.use(bodyParser.json());
app.use(cors());


// === GET Requests ===
app.get('/', (req, res) => {
    res.send(database.users);
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;

    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            return res.json(user);
        }
    });

    if (!found) {
        res.status(404).json('not found');
    }
});

// === POST Requests ===
app.post('/signin', (req, res) => {
    if ((req.body.emailOrUsername === database.users[0].email || req.body.emailOrUsername === database.users[0].username) && 
        req.body.password === database.users[0].password) {
        // res.json("success");
        res.json(database.users[0]);
    } else {
        res.status(400).json("Error logging in.");
    }
});

app.post('/register', (req, res) => {
    const { email, username, password } = req.body;

    // bcrypt.hash(password, 10, function(err, hash) {
    //     console.log(hash);
    // });

    database.users.push({
        id: '3',
        username: username,
        email: email,
        entries: 0,
        joined: new Date()
    });

    res.json(database.users.at(-1));
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
        // res.json(data);
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
    let found = false;

    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    });

    if (!found) {
        res.status(404).json('not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

/*
    / --> GET res = this is working
    /signin --> POST --> success/fail
    /register --> POST --> user
    /profile/:userId --> GET = user
    /image --> PUT --> user
*/
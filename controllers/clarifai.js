require('dotenv').config();

const CLARIFAI_MODEL_ID = 'face-detection';
const USER_ID = 'clarifai';
const APP_ID = 'main';
const CLARIFAI_API_URL = `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`;
const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;

async function handleClarifai(req, res, nodeFetch) {
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
}

module.exports = {
    handleClarifai
};
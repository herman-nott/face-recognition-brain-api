# Face Recognition Brain — Backend API

## Project Overview

This is the backend API of the **Face Recognition Brain** web application. It accepts image URLs, processes them using a face recognition service or model, and returns face detection data to the frontend.

The server handles requests from the frontend, communicates with external face recognition APIs (such as Clarifai, Microsoft Face API, or a custom ML model), and sends back detected face coordinates.

## Technologies

- Node.js + Express
- External face recognition API (Clarifai)
- Deployed on Render.com

## API Endpoints

| Method | Path           | Description                                         |
|--------|----------------|-----------------------------------------------------|
| GET    | `/`            | Root endpoint (can return basic info or status)     |
| GET    | `/profile/:id` | Get user profile data by user ID                     |
| POST   | `/signin`      | User sign in with email and password                 |
| POST   | `/register`    | Register a new user                                  |
| POST   | `/clarifai`    | Send image URL for face detection using Clarifai API|
| PUT    | `/image`       | Update user's image count (increment face detections)|

## How Requests Are Handled

- `/signin` and `/register` endpoints handle user authentication using bcrypt for secure password hashing.
- `/clarifai` calls the Clarifai API via `node-fetch` to get face recognition data.
- `/image` updates the count of how many images the user has processed.
- `/profile/:id` returns the profile data including the image count.
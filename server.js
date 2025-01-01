console.log('Starting server...');

require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 5000;
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
app.use(cors());

//spotify api credentials
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});

//login route
app.get('/login', (req, res) => {
    const scopes = [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'user-top-read', //for top tracks
        'user-library-read', //for saved tracks
    ];
    const authUrl = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(authUrl);
});

//me route
app.get ('/me', async (req, res) => {
    try {
        console.log('Attempting to fetch user data...');
        await ensureAccessToken(); //ensure valid token
        const userData = await spotifyApi.getMe();
        res.json(userData.body); //send data to client
    } catch (error) {
        if (error.statusCode === 401) {
            console.error('Invalid or expired token. Please refresh.');
        } else {
            console.error('Unexpected error:', error);
        }
        res.status(400).send('Failed to fetch user data.');
    }
})

//callback route
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Missing authorization code.');
    }

    try {
        //exchange auth code for access token
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body.access_token;
        const refreshToken = data.body.refresh_token;
        const expiresIn = data.body.expires_in;

        //save access token for later api calls
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        //redirect to React app
        res.redirect(`http://localhost:3000/home?token=${accessToken}&expires_in=${expiresIn}`);
    } catch (error) {
        console.error('Error authenticating with Spotify:', error);
        res.status(400).send('Authentication failed.');
    }
});

//refresh access token
app.get('/refresh-token', async (req, res) => {
    try {
        console.log('Refreshing access token...');
        const data = await spotifyApi.refreshAccessToken();
        const accessToken = data.body.access_token;

        spotifyApi.setAccessToken(accessToken);
        res.json({ accessToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(400).send('Failed to refresh token');
    }
});

app.get('/api', (req, res) => {
    res.send({ message: 'API is working!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

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

//grabs all the stuff from spotify
app.get('/user-stats', async (req, res) => {
    console.log('Hit /user-stats endpoint');

    const timeRange = req.query.time_range || 'long_term'; // Default to 'All Time'

    try {
        console.log('Fetching user data...');
        console.log('Access Token:', spotifyApi.getAccessToken());

        if (!spotifyApi.getAccessToken()) {
            return res.status(401).send('No access token available. Please log in.');
        }

        // Fetch user profile
        const userData = await spotifyApi.getMe();

        // Fetch user's top artists and tracks
        const topArtists = await spotifyApi.getMyTopArtists({ time_range: timeRange, limit: 10 });
        const topTracks = await spotifyApi.getMyTopTracks({ time_range: timeRange, limit: 10 });

        //top artist of all time
        const topArtist = topArtists.body.items[0];

        // Format top artists
        const artists = topArtists.body.items.map((artist) => ({
            name: artist.name,
            image: artist.images[0]?.url || '', // Artist image or empty string
        }));

        // Format top tracks
        const tracks = topTracks.body.items.map((track) => ({
            name: track.name,
            artist: track.artists[0]?.name || '', // First artist name or empty string
            image: track.album.images[0]?.url || '', // Album cover image
        }));

        // Send response
        res.json({
            name: userData.body.display_name,
            profilePicture: userData.body.images[0]?.url || '', // Profile picture or empty string
            artists, // Top 10 artists
            tracks, // Top 10 tracks
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(400).send('Failed to fetch user data.');
    }
});

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

console.log('Starting server...');

require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 5000;
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const userSpotifyApis = new Map(); //store instances per user
app.use(cors());

//spotify api credentials
const createSpotifyApi = () => {
    return new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
    });
};

//login route
app.get('/login', (req, res) => {
    spotifyApi = createSpotifyApi(); //new instance
    const scopes = [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'user-top-read', //for top tracks
        'user-library-read', //for saved tracks
    ];
    const authUrl = spotifyApi.createAuthorizeURL(scopes) + '&show_dialog=true';
    res.redirect(authUrl);
});

app.get('/logout', (req, res) => {
    const accessToken = req.query.token; //pass token to logout request

    if (accessToken && userSpotifyApis.has(accessToken)) {
        userSpotifyApis.delete(accessToken);
        console.log(`Logged out user with token: ${accessToken}`);
    }
    res.status(200).send('Logged out successfully')
})

//grabs all the stuff from spotify
app.get('/user-stats', async (req, res) => {

    // const spotifyApi = createSpotifyApi(); //new instance per request
    const accessToken = req.query.token; //pass the token in the request

    if (!accessToken || !userSpotifyApis.has(accessToken)) {
        return res.status(401).send('No valid session found. Please log in again.');
    }

    const { spotifyApi } = userSpotifyApis.get(accessToken) //retrieve user's instance

    console.log('Hit /user-stats endpoint');

    console.log('Fetching user stats...');
    console.log('Access Token:', spotifyApi.getAccessToken());

    const timeRange = req.query.time_range || 'long_term'; // Default to 'All Time'


    try {
        console.log('Fetching user data...');
        console.log('Access Token:', spotifyApi.getAccessToken());

        if (!spotifyApi.getAccessToken()) {
            return res.status(401).send('No access token available. Please log in.');
        }

        // Fetch user profile
        const userData = await spotifyApi.getMe();
        console.log('User Data:', userData.body);

        // Fetch user's top artists and tracks
        const topArtists = await spotifyApi.getMyTopArtists({ time_range: timeRange, limit: 10 });
        console.log('Top Artists:', topArtists.body);
        const topTracks = await spotifyApi.getMyTopTracks({ time_range: timeRange, limit: 10 });
        console.log('Top Tracks:', topTracks.body);
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
        if (error.body) {
          console.error('Spotify error body:', error.body);
        }
        res.status(400).send('Failed to fetch user data.');
      }
});

//callback route
app.get('/callback', async (req, res) => {
    const spotifyApi = createSpotifyApi(); //new instance per request
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

        //set tokens for this instance
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        //save instance for this user
        userSpotifyApis.set(accessToken, {
            spotifyApi,
            refreshToken,
        });

        //redirect to React app
        res.redirect(`http://localhost:3000/home?token=${accessToken}&expires_in=${expiresIn}`);
    } catch (error) {
        console.error('Error authenticating with Spotify:', error);
        res.status(400).send('Authentication failed.');
    }
});

//refresh access token
app.get('/refresh-token', async (req, res) => {
    const accessToken = req.query.token;

    if (!accessToken || !userSpotifyApis.has(accessToken)) {
        return res.status(401).send('No valid session found. Please log in again.');
    }
    
    const { spotifyApi, refreshToken } = userSpotifyApis.get(accessToken);


    try {
        console.log('Refreshing access token...');
        spotifyApi.setRefreshToken(refreshToken);
        const data = await spotifyApi.refreshAccessToken();
        const newAccessToken = data.body.access_token;

        spotifyApi.setAccessToken(newAccessToken);
        userSpotifyApis.set(newAccessToken, { spotifyApi, refreshToken });
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

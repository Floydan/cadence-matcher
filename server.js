const express = require('express'), // Express web server framework
    request = require('request'), // "Request" library
    cors = require('cors'),
    querystring = require('querystring'),
    cookieParser = require('cookie-parser'),
    dotenv = require('dotenv'),
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon'),
    path = require('path');
dotenv.config();

const port = process.env.PORT,
    clientId = process.env.CLIENT_ID,
    clientSecret = process.env.CLIENT_SECRET,
    redirectUri = process.env.REDIRECT_URI;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/dist'))
    .use(favicon(path.join(__dirname, 'dist', 'favicon.ico')))
    .use(cors())
    .use(bodyParser.json())
    .use(cookieParser());

app.get('/login', function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state
        }));
});

app.get('/callback', function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        const auth = clientId + ':' + clientSecret;
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.alloc(auth.length, auth).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                const access_token = body.access_token,
                    refresh_token = body.refresh_token;

                const options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    json: true
                };

                // use the access token to access the Spotify Web API
                // request.get(options, function (error, response, body) {

                // });

                // we can also pass the token to the browser to make requests from there
                res.redirect('/#/?' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/#/?' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

//refresh access token
app.get('/refresh_token', function (req, res) {

    // requesting access token from refresh token
    const refresh_token = req.query.refresh_token;
    const auth = clientId + ':' + clientSecret;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (Buffer.alloc(auth.length, auth).toString('base64'))
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            let new_refresh_token = body.refresh_token;
            if (!new_refresh_token)
                new_refresh_token = refresh_token;
            res.send({
                'access_token': access_token,
                'refresh_token': new_refresh_token
            });
        }
    });
});

//Get playlists
app.get('/playlists', function (req, res) {
    const accessToken = req.headers.accesstoken;
    var options = {
        url: `https://api.spotify.com/v1/me/playlists?${querystring.stringify({
            limit: 30,
            offset: 0
        })}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        json: true
    };

    request.get(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            res.statusCode = 500;
            res.send({
                error: error,
                statusCode: response.statusCode,
                body: body
            });
        }
    })
});

//Get recommendations
app.get('/recommendations', function (req, res) {
    const accessToken = req.headers.accesstoken;
    const energy = req.query.energy,
        acousticness = req.query.acousticness,
        danceability = req.query.danceability,
        instrumentalness = req.query.instrumentalness,
        liveness = req.query.liveness,
        valence = req.query.valence,
        market = req.query.market || 'SE';
    const tempo = req.query.tempo;

    let genres = req.query.genres; //|| 'edm,dance,techno,hardstyle'

    let query = {
        limit: 100,
        market: market,
        min_tempo: Number(tempo[0]),
        target_tempo: Number(tempo[1]),
        max_tempo: Number(tempo[2]),
        min_energy: Number(energy[0]),
        max_energy: Number(energy[1]),
        min_acousticness: Number(acousticness[0]),
        max_acousticness: Number(acousticness[1]),
        min_danceability: Number(danceability[0]),
        max_danceability: Number(danceability[1]),
        min_instrumentalness: Number(instrumentalness[0]),
        max_instrumentalness: Number(instrumentalness[1]),
        min_liveness: Number(liveness[0]),
        max_liveness: Number(liveness[1]),
        min_valence: Number(valence[0]),
        max_valence: Number(valence[1])
    };

    if (genres && genres.length !== 0) {
        query.seed_genres = [...genres].slice(0, 5).join(',');
    }

    var options = {
        url: `https://api.spotify.com/v1/recommendations?${querystring.stringify(query)}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        json: true
    };

    request.get(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            res.statusCode = 500;
            res.send({
                error: error,
                statusCode: response.statusCode,
                body: body
            });
        }
    })
});

app.post('/playlists/add/:userid', function (req, res) {
    const accessToken = req.headers.accesstoken;
    const userId = req.params.userid,
        name = req.body.name,
        description = req.body.description,
        public = req.body.public;

    var options = {
        url: `https://api.spotify.com/v1/users/${userId}/playlists `,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        json: {
            name,
            description,
            public
        }
    };

    request.post(options, function (error, response, body) {
        if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
            res.send(body);
        } else {
            res.statusCode = 500;
            res.send({
                error: error,
                statusCode: response.statusCode,
                body: body
            });
        }
    })

});

// Add track to playlist
app.post('/playlists/:id', function (req, res) {
    const accessToken = req.headers.accesstoken;
    const playlistId = req.params.id,
        trackUri = req.body.trackUri;

    var options = {
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?${querystring.stringify({
            uris: trackUri
        })}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        json: true
    };

    request.post(options, function (error, response, body) {
        if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
            res.send(body);
        } else {
            res.statusCode = 500;
            res.send({
                error: error,
                statusCode: response.statusCode,
                body: body
            });
        }
    })

});

// Get playlist tracks
app.get('/playlists/:id', function (req, res) {
    const accessToken = req.headers.accesstoken;
    const playlistId = req.params.id,
        trackUri = req.body.trackUri;

    var options = {
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?${querystring.stringify({
            uris: trackUri
        })}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        json: true
    };

    request.get(options, function (error, response, body) {
        if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
            res.send(body);
        } else {
            res.statusCode = 500;
            res.send({
                error: error,
                statusCode: response.statusCode,
                body: body
            });
        }
    })

});

console.log(`Listening on ${port}`);
app.listen(port);
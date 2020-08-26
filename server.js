var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var dotenv = require('dotenv');
var bodyParser = require('body-parser');
dotenv.config();

const port = process.env.PORT,
    clientId = process.env.CLIENT_ID,
    clientSecret = process.env.CLIENT_SECRET,
    redirectUri = process.env.REDIRECT_URI;

console.log(process.env);

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

app.use(express.static(__dirname + '/public'))
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

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function (error, response, body) {
                    console.log(body);
                });

                // we can also pass the token to the browser to make requests from there
                res.redirect('/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/refresh_token', function (req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});


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
        }
    })
});

app.get('/recommendations', function (req, res) {
    const accessToken = req.headers.accesstoken;
    const min_tempo = req.query.minBpm,
        max_tempo = req.query.maxBpm,
        target_tempo = req.query.targetBpm,
        genres = req.query.genres || 'edm,dance,techno,hardstyle';


    var options = {
        url: `https://api.spotify.com/v1/recommendations?${querystring.stringify({
            limit: 50,
            offset: 0,
            market: 'SE',
            seed_genres: genres,
            min_tempo,
            max_tempo,
            target_tempo
        })}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        json: true
    };

    request.get(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        }
    })
});

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
        }
    })

});

console.log(`Listening on ${port}`);
app.listen(port);
const ComfyWeb = require('webwebweb'), // Express web server framework
    axios = require('axios'),
    querystring = require('querystring'),
    dotenv = require('dotenv');

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

ComfyWeb.APIs['login'] = (qs, body, opts) => {

    var state = generateRandomString(16);
    opts.res.setHeader('Set-Cookie', `${stateKey}=${state}; SameSite=None; Secure`);

    // your application requests authorization
    var scope = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public';

    redirect(opts.res, 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state
        }));
};

//login callback method
ComfyWeb.APIs['callback'] = async (qs, body, opts) => {

    let code = qs.code || null;
    let state = qs.state || null;
    let storedState = opts.req.headers.cookie ? opts.req.headers.cookie.split('=')[1] : null;

    if (state === null || state !== storedState) {
        redirect(opts.res, '/#' + querystring.stringify({
            error: 'state_mismatch'
        }));
    } else {
        opts.res.setHeader('Set-Cookie', `${stateKey}=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        const auth = clientId + ':' + clientSecret;

        var form = `code=${code}&redirect_uri=${redirectUri}&grant_type=authorization_code`;

        try {

            const response = await axios.post('https://accounts.spotify.com/api/token', form,
                {
                    headers: {
                        'Authorization': 'Basic ' + (Buffer.alloc(auth.length, auth).toString('base64'))
                    }
                });

            if (response.status === 200) {
                redirect(opts.res, `/#/?${querystring.stringify(response.data)}`);
            } else {
                redirect(opts.res, `/#/?${querystring.stringify({ error: 'invalid_token' })}`);
            }
        }
        catch (e) {
            opts.res.statusCode = 500;
            redirect(opts.res, '/#' + querystring.stringify({
                error: 'state_mismatch'
            }));
        }
    }

}

//refresh access token
ComfyWeb.APIs['refresh_token'] = async (qs, body, opts) => {

    // requesting access token from refresh token
    const refresh_token = qs.refresh_token;
    const auth = clientId + ':' + clientSecret;

    const form = `grant_type=refresh_token&refresh_token${refresh_token}`;

    try {

        var response = await axios.post('https://accounts.spotify.com/api/token', form, {
            headers: {
                'Authorization': 'Basic ' + (Buffer.alloc(auth.length, auth).toString('base64'))
            }
        });
        if (response.status === 200) {
            const access_token = response.data.access_token;
            let new_refresh_token = response.data.refresh_token;
            if (!new_refresh_token)
                new_refresh_token = refresh_token;

            return {
                'access_token': access_token,
                'refresh_token': new_refresh_token
            };
        }

    }
    catch (e) {
        opts.res.statusCode = 500;
        return {
            statusCode: 500,
            body: e
        };
    }
};

ComfyWeb.APIs['search'] = async (qs, body, opts) => {
    const accessToken = opts.req.headers.accesstoken;
    const type = qs.type,
        q = qs.q,
        market = 'from_token';

    const query = { type, q, market };

    try {

        const response = await axios.get(`https://api.spotify.com/v1/search?${querystring.stringify(query)}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 200) {
            return response.data;
        } else {
            opts.res.statusCode = 500;
            return {
                statusCode: response.status,
                body: response.data
            };
        }
    }
    catch (e) {
        opts.res.statusCode = 500;
        return {
            statusCode: 500,
            body: e
        };
    }

};

//Get playlists
ComfyWeb.APIs['playlists'] = async (qs, body, opts) => {
    const accessToken = opts.req.headers.accesstoken;

    try {

        const response = await axios.get(`https://api.spotify.com/v1/me/playlists?${querystring.stringify({
            limit: 30,
            offset: 0
        })}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 200) {
            return response.data;
        } else {
            opts.res.statusCode = 500;
            return {
                statusCode: response.status,
                body: response.data
            };
        }

    }
    catch (e) {
        opts.res.statusCode = 500;
        return {
            statusCode: 500,
            body: e
        };
    }
};

//Get recommendations
ComfyWeb.APIs['recommendations'] = async (qs, body, opts) => {
    const accessToken = opts.req.headers.accesstoken;
    const energy = qs['energy[]'],
        acousticness = qs['acousticness[]'],
        danceability = qs['danceability[]'],
        instrumentalness = qs['instrumentalness[]'],
        liveness = qs['liveness[]'],
        valence = qs['valence[]'],
        market = 'from_token',
        tempo = qs["tempo[]"],
        genres = [qs['genres[]']],
        artists = [qs['artists[]']],
        tracks = [qs['tracks[]']];

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
    if (artists && artists.length !== 0) {
        query.seed_artists = [...artists].slice(0, 5).join(',');
    }
    if (tracks && tracks.length !== 0) {
        query.seed_tracks = [...tracks].slice(0, 5).join(',');
    }

    try {

        const response = await axios.get(`https://api.spotify.com/v1/recommendations?${querystring.stringify(query)}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 200) {
            return response.data;
        } else {
            opts.res.statusCode = 500;
            return {
                statusCode: response.status,
                body: response.data
            };
        }

    }
    catch (e) {
        opts.res.statusCode = 500;
        return {
            statusCode: 500,
            body: e
        };
    }
};

//create playlist
ComfyWeb.APIs['playlists/add/*'] = async (qs, body, opts) => {
    const accessToken = opts.req.headers.accesstoken;
    body = JSON.parse(String.fromCharCode(...body));
    const userId = opts.params[0],
        name = body.name,
        description = body.description,
        public = body.public;

    try {

        const response = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            name,
            description,
            public
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if ((response.status === 200 || response.status === 201)) {
            return response.data;
        } else {
            opts.res.statusCode = 500;
            return {
                statusCode: response.status,
                body: response.data
            };
        }

    }
    catch (e) {
        opts.res.statusCode = 500;
        return {
            statusCode: 500,
            body: e
        };
    }
};

// Add track to playlist
ComfyWeb.APIs['playlists/*'] = async (qs, body, opts) => {
    const accessToken = opts.req.headers.accesstoken;
    body = JSON.parse(String.fromCharCode(...body));
    const playlistId = opts.params[0],
        trackUri = body.trackUri;

    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    if (opts.req.method === "POST") {
        url += `?${querystring.stringify({
            uris: trackUri
        })}`;
    }

    try {

        const response = await axios.post(url, null, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 200 || response.status === 201) {
            return response.data;
        } else {
            opts.res.statusCode = 500;
            return {
                statusCode: response.status,
                body: response.data
            };
        }

    }
    catch (e) {
        opts.res.statusCode = 500;
        return {
            statusCode: 500,
            body: e
        };
    }
};

redirect = (res, url) => {
    res.setHeader('Location', url);
    res.statusCode = 302;
}


console.log(`Listening on ${port}`);
ComfyWeb.Run(port);
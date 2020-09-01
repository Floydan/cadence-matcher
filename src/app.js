import './sass/main.scss'

import Vue from 'vue'
import spotifyTrack from './components/spotify-track.vue'
import userCard from './components/user-card.vue'
import Spotify from './spotify'
import Utilities from './utilities';
import axios from 'axios';

const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration));

var app = new Vue({
    el: '#app',
    data: {
        loggedIn: false,
        tracks: [],
        searchFilter: {
            minBpm: 125,
            targetBpm: 130,
            maxBpm: 140,
            genres: []
        },
        access_token: '',
        refresh_token: '',
        selectedPlaylistId: '',
        playlists: [],
        genres: [],
        user: {},
        tokenExpiresAt: new Date(Date.now() - 1000)
    },
    methods: {
        async getRecommendations() {
            this.tracks = await Spotify.getRecommendations(this.accessToken, this.searchFilter)
        }
    },
    components: {
        userCard,
        spotifyTrack,
    },
    beforeMount: async function () {
        var params = Utilities.getHashParams();
        this.accessToken = params.access_token;
        this.refreshToken = params.refresh_token;
        const error = params.error;

        if (!this.accessToken) {

            const tokens = JSON.parse(localStorage.getItem('tokens'));

            if(!tokens || !tokens.accessToken)
                return;

            this.accessToken = tokens.accessToken;
            this.refreshToken = tokens.refreshToken;
        }

        // remove fragment as much as it can go without adding an entry in browser history:
        window.location.replace("#");

        localStorage.setItem('tokens', JSON.stringify( { accessToken: this.accessToken, refreshToken: this.refreshToken}));

        var expiration = localStorage.getItem('token-expiration');
        if (expiration) {
            this.tokenExpiresAt = new Date(JSON.parse(expiration));
            console.log(this.tokenExpiresAt);
        }

        if (Date.now() > this.tokenExpiresAt) {
            console.log('getNewAccessToken');
            const response = Spotify.getNewAccessToken(this.refreshToken).then((response) => {
                this.accessToken = response.data.access_token;
                var now = new Date().setTime(new Date().getTime() + (3600 * 1000));
                this.tokenExpiresAt = new Date(now);
                console.log(this.tokenExpiresAt);
                localStorage.setItem('token-expiration', JSON.stringify(this.tokenExpiresAt));
            });
        }

        setAxiosInterceptors(this, this.accessToken, this.refreshToken);

        const userResponse = await Spotify.getUser(this.accessToken);

        console.log('userResponse', userResponse);

        if (userResponse.status === 200) {
            this.loggedIn = true;
            this.user = userResponse.data;
            this.playlists = await Spotify.getPlaylists(this.accessToken);
            this.genres = await Spotify.getGenres(this.accessToken);
            this.searchFilter = {
                ...this.searchFilter,
                ...Utilities.getFilters()
            };
        } else if (userResponse.status === 401) {
            if (this.refreshToken) {
                const response = await Spotify.getNewAccessToken(this.refreshToken);

                if (response.status === 200) {
                    this.accessToken = response.data.access_token;
                    this.refreshToken = response.data.refresh_token;

                    getUserData(this.accessToken);
                }
            } else {
                this.loggedIn = false;
                this.accessToken = '';
                this.refreshToken = '';

                window.location = '/#';
            }
        }
    }
});

function setAxiosInterceptors(app, accessToken, refreshToken) {
    axios.interceptors.response.use(config => {
        return config;
    }, async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            Spotify.getNewAccessToken(refreshToken).then(response => {
                app.accessToken = response.data.access_token;
                app.refreshToken = response.data.refresh_token; 
                
                const now = new Date().setTime(new Date().getTime() + (3600 * 1000));
                app.tokenExpiresAt = new Date(now);

                if(originalRequest.headers['Autorization'])
                    axios.defaults.headers.common['Authorization'] = `Bearer ${app.accessToken}`;
                if(originalRequest.headers['accessToken'])
                    axios.defaults.headers.common['accessToken'] = app.accessToken;
                
                localStorage.setItem('tokens', JSON.stringify( { accessToken: app.accessToken, refreshToken: app.refreshToken, expiration: app.tokenExpiresAt}));
                localStorage.setItem('token-expiration', JSON.stringify(app.tokenExpiresAt));

                return axios(originalRequest);
            });
        }

        return Promise.reject(error);
    });
}

async function getUserData(accessToken) {
    const userResponse = await Spotify.getUser(accessToken);
    if (userResponse === 200) {
        app.loggedIn = true;
        app.user = userResponse.data;
        app.playlists = await Spotify.getPlaylists(accessToken);
        app.genres = await Spotify.getGenres(accessToken);
        app.searchFilter = {
            ...app.searchFilter,
            ...Utilities.getFilters()
        };
    }
}
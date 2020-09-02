import './sass/main.scss'

import Vue from 'vue'
import spotifyTrack from './components/spotify-track.vue'
import userCard from './components/user-card.vue'
import SpotifyService from './services/spotifyService'
import Utilities from './utilities';
import StorageService from './services/storageService'
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
        tokenExpiresAt: new Date(Date.now() - 1000),
        searchInProgress: false
    },
    methods: {
        async getRecommendations() {
            this.searchInProgress = true;
            this.tracks = await SpotifyService.getRecommendations(this.accessToken, this.searchFilter)
            this.searchInProgress = false;
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

        const tokens = StorageService.getTokens();
        if (!this.accessToken) {

            if (!tokens || !tokens.accessToken)
                return;

            this.accessToken = tokens.accessToken;
            this.refreshToken = tokens.refreshToken;
        }

        // remove fragment as much as it can go without adding an entry in browser history:
        window.location.replace("#");

        StorageService.setTokens({
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expire: tokens.expire
        });

        if (tokens.expire) {
            this.tokenExpiresAt = tokens.expire;
        }

        if (Date.now() > this.tokenExpiresAt) {
            SpotifyService.getNewAccessToken(this.refreshToken).then((response) => {
                this.accessToken = response.data.access_token;
                this.refreshToken = response.data.refresh_token;

                var now = new Date().setTime(new Date().getTime() + (3600 * 1000));
                this.tokenExpiresAt = new Date(now);

                StorageService.setTokens({
                    accessToken: this.accessToken,
                    refreshToken: this.refreshToken,
                    expire: tokens.expire
                });
            });
        }

        setAxiosInterceptors(this, this.accessToken, this.refreshToken);

        const userResponse = await SpotifyService.getUser(this.accessToken);

        if (userResponse.status === 200) {
            this.loggedIn = true;
            this.user = userResponse.data;
            this.playlists = await SpotifyService.getPlaylists(this.accessToken);
            this.genres = await SpotifyService.getGenres(this.accessToken);
            this.searchFilter = {
                ...this.searchFilter,
                ...StorageService.getFilters()
            };
        } else if (userResponse.status === 401) {
            if (this.refreshToken) {
                const response = await SpotifyService.getNewAccessToken(this.refreshToken);

                if (response.status === 200) {
                    this.accessToken = response.data.access_token;
                    this.refreshToken = response.data.refresh_token;

                    var now = new Date().setTime(new Date().getTime() + (3600 * 1000));
                    this.tokenExpiresAt = new Date(now);

                    StorageService.setTokens({
                        accessToken: this.accessToken,
                        refreshToken: this.refreshToken,
                        expire: tokens.expire
                    });
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
            SpotifyService.getNewAccessToken(refreshToken).then(response => {
                app.accessToken = response.data.access_token;
                app.refreshToken = response.data.refresh_token;

                const now = new Date().setTime(new Date().getTime() + (3600 * 1000));
                app.tokenExpiresAt = new Date(now);

                if (originalRequest.headers['Autorization'])
                    axios.defaults.headers.common['Authorization'] = `Bearer ${app.accessToken}`;
                if (originalRequest.headers['accessToken'])
                    axios.defaults.headers.common['accessToken'] = app.accessToken;

                StorageService.setTokens({
                    accessToken: app.accessToken,
                    refreshToken: app.refreshToken,
                    expire: app.expire
                });

                return axios(originalRequest);
            });
        }

        return Promise.reject(error);
    });
}

async function getUserData(accessToken) {
    const userResponse = await SpotifyService.getUser(accessToken);
    if (userResponse === 200) {
        app.loggedIn = true;
        app.user = userResponse.data;
        app.playlists = await SpotifyService.getPlaylists(accessToken);
        app.genres = await SpotifyService.getGenres(accessToken);
        app.searchFilter = {
            ...app.searchFilter,
            ...StorageService.getFilters()
        };
    }
}
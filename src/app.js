
import 'vue-slider-component/theme/default.css';
import './sass/main.scss'

import Vue from 'vue'
import Utilities from './utilities';
import StorageService from './services/storageService'
import axios from 'axios';

import spotifyTrack from './components/spotify-track.vue'
import userCard from './components/user-card.vue'
import SpotifyService from './services/spotifyService'
import VueSlider from 'vue-slider-component';

const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration));

var app = new Vue({
    el: '#app',
    data: {
        loggedIn: false,
        tracks: [],
        playlistTracks: [],
        searchFilter: {
            tempo: [120, 140, 160],
            genres: [],
            energy: [0.0, 1.0],
            acousticness: [0.0, 1.0],
            danceability: [0.0, 1.0],
            instrumentalness: [0.0, 1.0],
            liveness: [0.0, 1.0],
            valence: [0.0, 1.0]
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
            this.tracks = await SpotifyService.getRecommendations(this.accessToken, this.searchFilter);
            this.searchInProgress = false;
        },
        async getPlaylistTracks() {
            if(!this.selectedPlaylistId) return;
            this.playlistTracks = await SpotifyService.getPlaylistTracks(this.accessToken, this.selectedPlaylistId);
        }
    },
    watch: {
        'searchFilter.targetBpm': function(newVal, oldVal) {
            this.searchFilter.minBpm = newVal - 5;
            this.searchFilter.maxBpm = newVal + 5;
        }
    },
    components: {
        userCard,
        spotifyTrack,
        VueSlider
    },
    beforeMount: async function () {
        let filtersTest = StorageService.getFilters();
        if(filtersTest && !filtersTest.tempo) {
            StorageService.setFilters(this.searchFilter);
        }

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
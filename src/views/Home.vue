<template>
  <div id="loggedin">
    <user-card v-bind:user="user"></user-card>
    <div class="panel search-panel form">
      <div>
        <b>Target Tempo [min, target, max] BPM:</b>
        {{searchFilter.tempo}}
        <vue-slider
          v-model="searchFilter.tempo"
          :min="50.0"
          :max="250.0"
          :interval="5"
          :marks="true"
          :hide-label="true"
        ></vue-slider>
      </div>
      <div class="sliders">
        <div>
          <b>Energy:</b>
          {{searchFilter.energy}}
          <vue-slider
            v-model="searchFilter.energy"
            :min="0.0"
            :max="1.0"
            :interval="0.1"
            :marks="true"
            :hide-label="true"
          ></vue-slider>
        </div>

        <div>
          <b>Acousticness:</b>
          {{searchFilter.acousticness}}
          <vue-slider
            v-model="searchFilter.acousticness"
            :min="0.0"
            :max="1.0"
            :interval="0.1"
            :marks="true"
            :hide-label="true"
          ></vue-slider>
        </div>

        <div>
          <b>Danceability:</b>
          {{searchFilter.danceability}}
          <vue-slider
            v-model="searchFilter.danceability"
            :min="0.0"
            :max="1.0"
            :interval="0.1"
            :marks="true"
            :hide-label="true"
          ></vue-slider>
        </div>

        <div>
          <b>Instrumentalness:</b>
          {{searchFilter.instrumentalness}}
          <vue-slider
            v-model="searchFilter.instrumentalness"
            :min="0.0"
            :max="1.0"
            :interval="0.1"
            :marks="true"
            :hide-label="true"
          ></vue-slider>
        </div>

        <div>
          <b>Liveness:</b>
          {{searchFilter.liveness}}
          <vue-slider
            v-model="searchFilter.liveness"
            :min="0.0"
            :max="1.0"
            :interval="0.1"
            :marks="true"
            :hide-label="true"
          ></vue-slider>
        </div>

        <div>
          <b>Valence:</b>
          {{searchFilter.valence}}
          <vue-slider
            v-model="searchFilter.valence"
            :min="0.0"
            :max="1.0"
            :interval="0.1"
            :marks="true"
            :hide-label="true"
          ></vue-slider>
        </div>
      </div>
      <div class="form">
        <div class="form-group">
          <label for="genres">Genres (max 5)</label>
          <select id="genres" class="form-control" v-model="searchFilter.genres" multiple required>
            <option v-for="genre in genres" v-bind:value="genre" v-bind:key="genre">{{genre}}</option>
          </select>
          <div>
            <b>Selected ({{searchFilter.genres.length}}): </b>
            <i v-for="genre in searchFilter.genres" v-bind:key="genre">{{genre}} &nbsp;</i>
          </div>
        </div>

        <div class="form-group playlists-container">
          <label for="playlists">Playlists</label>
          <select
            id="playlists"
            class="form-control"
            v-model="selectedPlaylistId"
            v-on:change="getPlaylistTracks()"
          >
            <option value>Select a playlist to add songs to...</option>
            <option
              v-for="playlist in playlists"
              v-bind:value="playlist.id"
              v-bind:key="playlist.id"
            >{{playlist.name}}</option>
          </select>
        </div>
      </div>

      <button
        class="btn btn-info"
        style="margin-top: 2rem"
        id="searchBtn"
        v-on:click="getRecommendations()"
        v-bind:class="{'in-progress': searchInProgress}"
      >Find Recommendations</button>
    </div>

    <div class="tracks">
      <spotify-track
        v-for="track in tracks"
        :track="track"
        :playlist-tracks="playlistTracks"
        v-bind:key="track.id"
        v-bind:playlistId="selectedPlaylistId"
        v-bind:accessToken="accessToken"
      ></spotify-track>
    </div>
  </div>
</template>

<script>
import Utilities from "../utilities";
import StorageService from "../services/storageService";
import axios from "axios";

import spotifyTrack from "../components/spotify-track.vue";
import userCard from "../components/user-card.vue";
import SpotifyService from "../services/spotifyService";
import VueSlider from "vue-slider-component";

export default {
  data: () => {
    return {
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
        valence: [0.0, 1.0],
      },
      access_token: "",
      refresh_token: "",
      selectedPlaylistId: "",
      playlists: [],
      genres: [],
      user: {},
      tokenExpiresAt: new Date(Date.now() - 1000),
      searchInProgress: false,
    };
  },
  methods: {
    async getRecommendations() {
      this.searchInProgress = true;
      this.tracks = await SpotifyService.getRecommendations(
        this.accessToken,
        this.searchFilter
      );
      this.searchInProgress = false;
    },
    async getPlaylistTracks() {
      if (!this.selectedPlaylistId) return;
      this.playlistTracks = await SpotifyService.getPlaylistTracks(
        this.accessToken,
        this.selectedPlaylistId
      );
    },
  },
  watch: {
    "searchFilter.targetBpm": function (newVal, oldVal) {
      this.searchFilter.minBpm = newVal - 5;
      this.searchFilter.maxBpm = newVal + 5;
    },
  },
  components: {
    userCard,
    spotifyTrack,
    VueSlider,
  },
  beforeCreate: function () {
    var params = Utilities.getHashParams();
    this.accessToken = params["/?access_token"];
    this.refreshToken = params.refresh_token;
    const error = params.error;

    const tokens = StorageService.getTokens();
    if (!this.accessToken) {
      if (!tokens || !tokens.accessToken) {
        this.$router.push("login");
        return;
      }

      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
    }

    if (!this.accessToken || !this.refreshToken) {
      this.$router.push("login");
    }
  },
  beforeMount: async function () {
    let filtersTest = StorageService.getFilters();
    if (filtersTest && !filtersTest.tempo) {
      StorageService.setFilters(this.searchFilter);
    }

    var params = Utilities.getHashParams();
    this.accessToken = params["/?access_token"];
    this.refreshToken = params.refresh_token;
    const error = params.error;

    const tokens = StorageService.getTokens();
    if (!this.accessToken) {
      if (!tokens || !tokens.accessToken) return;

      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
    }

    if (!this.accessToken || !this.refreshToken) {
      this.$router.push("login");
    }

    // remove fragment as much as it can go without adding an entry in browser history:
    window.location.replace("#");

    if (!tokens.expire) {
      let now = new Date().setTime(new Date().getTime() + 3600 * 1000);
      this.tokenExpiresAt = new Date(now);
      tokens.expire = tokens.expire || this.tokenExpiresAt;
    }

    StorageService.setTokens({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expire: tokens.expire,
    });

    if (tokens.expire) {
      this.tokenExpiresAt = tokens.expire;
    }

    if (Date.now() > this.tokenExpiresAt) {
      const tokenResponse = await SpotifyService.getNewAccessToken(
        this.refreshToken
      );
      this.accessToken = tokenResponse.data.access_token;
      this.refreshToken = tokenResponse.data.refresh_token;

      now = new Date().setTime(new Date().getTime() + 3600 * 1000);
      this.tokenExpiresAt = new Date(now);

      StorageService.setTokens({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expire: tokens.expire,
      });
    }

    setAxiosInterceptors(this, this.accessToken, this.refreshToken);

    const userResponse = await SpotifyService.getUser(this.accessToken);

    if (userResponse.status === 200) {
      this.user = userResponse.data;
      this.playlists = await SpotifyService.getPlaylists(this.accessToken);
      this.genres = await SpotifyService.getGenres(this.accessToken);
      this.searchFilter = {
        ...this.searchFilter,
        ...StorageService.getFilters(),
      };
    } else {
      this.$router.push("login");
      this.accessToken = "";
      this.refreshToken = "";
      this.user = {};
      StorageService.clearTokens();

      this.$router.push("login");
    }
  },
};

function setAxiosInterceptors(app, accessToken, refreshToken) {
  axios.interceptors.response.use(
    (config) => {
      return config;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        SpotifyService.getNewAccessToken(refreshToken).then((response) => {
          app.accessToken = response.data.access_token;
          app.refreshToken = response.data.refresh_token;

          const now = new Date().setTime(new Date().getTime() + 3600 * 1000);
          app.tokenExpiresAt = new Date(now);

          if (originalRequest.headers["Autorization"])
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${app.accessToken}`;
          if (originalRequest.headers["accessToken"])
            axios.defaults.headers.common["accessToken"] = app.accessToken;

          StorageService.setTokens({
            accessToken: app.accessToken,
            refreshToken: app.refreshToken,
            expire: app.expire,
          });

          return axios(originalRequest);
        });
      }

      return Promise.reject(error);
    }
  );
}

async function getUserData(accessToken) {
  const userResponse = await SpotifyService.getUser(accessToken);
  if (userResponse === 200) {
    app.user = userResponse.data;
    app.playlists = await SpotifyService.getPlaylists(accessToken);
    app.genres = await SpotifyService.getGenres(accessToken);
    app.searchFilter = {
      ...app.searchFilter,
      ...StorageService.getFilters(),
    };
  } else {
    this.$router.push("login");
  }
}
</script>
<template>
  <div id="loggedin">
    <alerts :alert-types="['alert:home']"></alerts>
    <user-card v-bind:user="user"></user-card>
    <div id="filters" class="panel search-panel">
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
      <div class="seed-container">
        <b class="seed-toggle">
          Seeds
          <span
            class="badge badge-pill"
            :class="{ 'badge-light': seedCount <= 5 && seedCount >= 1, 'badge-danger': seedCount > 5 || seedCount < 1}"
          >{{seedCount}}</span>
        </b>
        <div class="form seeds">
          <div class="form-group">
            <label for="genres">
              <b>Genre seeds:</b>
            </label>
            <multiselect
              id="genres"
              v-model="searchFilter.genres"
              :placeholder="`Select up to ${5 - seedCount} genres`"
              :options="genres"
              :searchable="true"
              :allow-empty="true"
              :multiple="true"
              :max="5"
              :clear-on-select="false"
              :close-on-select="false"
            ></multiselect>

            <label for="artistsSearch">
              <b>Artist seeds:</b>
            </label>
            <multiselect
              id="artistsSearch"
              v-model="searchFilter.artists"
              :placeholder="`Select up to ${5 - seedCount} artists`"
              track-by="id"
              label="name"
              value="id"
              :options="artistsSearch"
              :searchable="true"
              :allow-empty="true"
              :multiple="true"
              :max="5"
              :loading="artistsSearchLoading"
              :internal-search="false"
              :clear-on-select="true"
              :close-on-select="true"
              @search-change="searchForArtist"
            ></multiselect>

            <label for="tracksSearch">
              <b>Track seeds:</b>
            </label>
            <multiselect
              id="tracksSearch"
              v-model="searchFilter.tracks"
              :placeholder="`Select up to ${5 - seedCount} tracks`"
              track-by="id"
              label="name"
              value="id"
              :options="tracksSearch"
              :searchable="true"
              :allow-empty="true"
              :multiple="true"
              :max="5"
              :loading="tracksSearchLoading"
              :internal-search="false"
              :clear-on-select="true"
              :close-on-select="true"
              @search-change="searchForTrack"
            ></multiselect>
          </div>
        </div>
      </div>
      <div class="playlists-container">
        <div class="mb-2 mr-2 flex-grow-1">
          <label for="playlists">Playlist to add songs to</label>
          <multiselect
            id="playlists"
            placeholder="Select a playlist..."
            v-model="selectedPlaylistId"
            label="name"
            value="id"
            :options="playlists"
            :multiple="false"
            :searchable="true"
            :allow-empty="true"
          ></multiselect>
        </div>
        <button
          class="btn btn-info mb-2"
          @click="addPlaylistModalVisible = !addPlaylistModalVisible"
        >+ Add</button>
      </div>
    </div>
    <div class="button-holder">
      <progress-button
        class
        :button-style="'flip-open'"
        :perspective="true"
        :horizontal="true"
        :vertical="false"
        :action="getRecommendations"
      >Find Recommendations</progress-button>
    </div>

    <add-playlist-modal
      v-if="user"
      :show-modal="addPlaylistModalVisible"
      :access-token="accessToken"
      :user-id="user.id"
      @close:playlist="playlistModalClosed"
      @added:playlist="playlistAdded"
    ></add-playlist-modal>

    <!-- <div class="mt-3 mb-3">
      <button class="mt-3 mb-3" @click="testEvents">Alert</button>
    </div>-->

    <div class="tracks">
      <spotify-track
        v-for="(track, i) in pagedTracks"
        :track="track"
        :playlist-track-ids="playlistTrackIds"
        :playlist-id="selectedPlaylistId"
        :access-token="accessToken"
        :key="`${i}-${track.id}`"
        @track:added="playlistTrackAdded"
        @track:addToSearch="addTrackToSearchFilter"
        @artist:addToSearch="addArtistToSearchFilter"
      ></spotify-track>
    </div>
    <p
      class="showing-info"
      v-if="tracks.length !== 0"
    >Showing {{pagedTracks.length}} of {{tracks.length}} tracks</p>
    <div style="margin-top: 2rem; text-align: center">
      <button
        v-if="tracks.length > 0"
        :disabled="tracks.length === pagedTracks.length"
        class="btn btn-success"
        @click="resultTake = resultTake + defaultTake"
      >Show {{defaultTake > loadMore ? loadMore : defaultTake}} more tracks</button>
    </div>
  </div>
</template>

<script>
import "../../node_modules/vue-multiselect/dist/vue-multiselect.min.css";

import Utilities from "../utilities";
import StorageService from "../services/storageService";
import SpotifyService from "../services/spotifyService";
import GlobalEventsService from "../services/globalEventsService";
import axios from "axios";
import debounce from "debounce";

import progressButton from "../components/progressButton.vue";
import spotifyTrack from "../components/spotify-track.vue";
import userCard from "../components/user-card.vue";
import addPlaylistModal from "../components/addPlaylistModal.vue";
import alerts from "../components/alerts.vue";
import VueSlider from "vue-slider-component";
import Multiselect from "vue-multiselect";

export default {
  data: () => {
    return {
      addPlaylistModalVisible: false,
      tracks: [],
      playlistTrackIds: [],
      searchFilter: {
        tempo: [120, 140, 160],
        genres: [],
        artists: [],
        tracks: [],
        energy: [0.0, 1.0],
        acousticness: [0.0, 1.0],
        danceability: [0.0, 1.0],
        instrumentalness: [0.0, 1.0],
        liveness: [0.0, 1.0],
        valence: [0.0, 1.0],
      },
      accessToken: "",
      refreshToken: "",
      selectedPlaylistId: "",
      playlists: [],
      genres: [],
      artistsSearch: [],
      tracksSearch: [],
      user: {},
      defaultTake: 20,
      resultTake: 20,
      pagedTracks: [],
      tokenExpiresAt: new Date(Date.now() - 1000),
      searchInProgress: false,
      loadMore: 0,
      artistsSearchLoading: false,
      tracksSearchLoading: false,
      searchTimeout: undefined,
    };
  },
  components: {
    "user-card": userCard,
    "spotify-track": spotifyTrack,
    "vue-slider": VueSlider,
    "progress-button": progressButton,
    "add-playlist-modal": addPlaylistModal,
    multiselect: Multiselect,
    alerts,
  },
  methods: {
    //Test method for alerts
    testEvents() {
      const r = Math.random() + 1;
      // GlobalEventsService.dispatch("alert:global", {
      //   severity: "info",
      //   message: `${r} - we did it!`,
      // });
      GlobalEventsService.dispatch("alert:home", {
        severity: "success",
        message: `${r} - we did it!`,
        timeout: 20000,
      });
      GlobalEventsService.dispatch("alert:home", {
        severity: "info",
        message: `${r} - we did it!`,
        timeout: 5000,
      });
      GlobalEventsService.dispatch("alert:home", {
        severity: "warning",
        message: `${r} - we did it!`,
        timeout: 1000,
      });
      GlobalEventsService.dispatch("alert:home", {
        severity: "danger",
        message: `${r} - we did it! but with a longer text to cause a linebreak`,
        timeout: 2000,
      });
    },
    async getRecommendations(button) {
      this.resultTake = this.defaultTake;
      this.searchInProgress = true;
      this.tracks = await SpotifyService.getRecommendations(
        this.accessToken,
        this.searchFilter,
        this.user.country
      );

      this.pagedTracks = this.tracks.slice(0, this.resultTake);

      if (button && button.stop) button.stop(this.tracks.length > 0 ? 1 : -1);
      this.searchInProgress = false;
    },
    async getPlaylistTracks() {
      if (!this.selectedPlaylistId) return;
      this.playlistTrackIds = (
        await SpotifyService.getPlaylistTracks(
          this.accessToken,
          this.selectedPlaylistId
        )
      ).map((t) => t.track.id);
    },
    searchForArtist(query) {
      if (query && query.length > 1) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
          this.artistsSearchLoading = true;
          this.artistsSearch = (
            await SpotifyService.search(this.accessToken, "artist", query)
          ).map((a) => {
            return { name: a.name, id: a.id };
          });
          this.artistsSearchLoading = false;
        }, 500);
      }
    },
    searchForTrack(query) {
      if (query && query.length > 1) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
          this.tracksSearchLoading = true;
          this.tracksSearch = (
            await SpotifyService.search(this.accessToken, "track", query)
          ).map((t) => {
            const trackArtists = t.artists.map((a) => a.name).join(", ");
            return { name: `${t.name} - ${trackArtists}`, id: t.id };
          });
          this.tracksSearchLoading = false;
        }, 500);
      }
    },
    playlistModalClosed() {
      this.addPlaylistModalVisible = false;
    },
    playlistAdded(playlist) {
      this.playlists.splice(0, 0, playlist);
      this.selectedPlaylistId = this.playlists[0].id;
      this.addPlaylistModalVisible = false;
    },
    playlistTrackAdded(track) {
      this.playlistTrackIds.push(track.id);
    },
    addTrackToSearchFilter(track) {
      this.searchFilter.tracks.push({
        name: `${track.name} - ${track.artists}`,
        id: track.id,
      });
      this.searchFilter.tracks = this.uniqueSeedTracks;
    },
    addArtistToSearchFilter(artists) {
      for (var artist of artists) {
        this.searchFilter.artists.push({
          name: `${artist.name}`,
          id: artist.id,
        });
      }
      this.searchFilter.artists = this.uniqueSeedArtists;
    },
  },
  computed: {
    seedCount() {
      return [
        ...this.searchFilter.genres,
        ...this.searchFilter.artists,
        ...this.searchFilter.tracks,
      ].length;
    },
    uniqueSeedArtists() {
      return Utilities.uniqueInArrayAdv(this.searchFilter.artists, "id");
    },
    uniqueSeedTracks() {
      return Utilities.uniqueInArrayAdv(this.searchFilter.tracks, "id");
    },
  },
  watch: {
    "searchFilter.targetBpm": function (newVal, oldVal) {
      this.searchFilter.minBpm = newVal - 5;
      this.searchFilter.maxBpm = newVal + 5;
    },
    resultTake: function (newVal) {
      this.pagedTracks = this.tracks.slice(0, this.resultTake);
    },
    pagedTracks: function (newVal) {
      const left = this.tracks.length - this.pagedTracks.length;
      this.loadMore = left;
    },
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
      return;
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
        expire: this.tokenExpiresAt,
      });
    }

    setAxiosInterceptors(this, this.accessToken, this.refreshToken);

    try {
      const userResponse = await SpotifyService.getUser(this.accessToken);

      this.user = userResponse.data;
      this.playlists = await SpotifyService.getPlaylists(this.accessToken);
      this.genres = await SpotifyService.getGenres(this.accessToken);
      this.searchFilter = {
        ...this.searchFilter,
        ...StorageService.getFilters(),
      };
    } catch (err) {
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
        const response = await SpotifyService.getNewAccessToken(refreshToken);
        app.accessToken = response.data.access_token;
        app.refreshToken = response.data.refresh_token;

        const now = new Date().setTime(new Date().getTime() + 3600 * 1000);
        app.tokenExpiresAt = new Date(now);

        if (originalRequest.headers["Autorization"]) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${app.accessToken}`;
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${app.accessToken}`;
        }

        if (originalRequest.headers["accessToken"]) {
          axios.defaults.headers.common["accessToken"] = app.accessToken;
          originalRequest.headers["accessToken"] = app.accessToken;
        }

        StorageService.setTokens({
          accessToken: app.accessToken,
          refreshToken: app.refreshToken,
          expire: app.tokenExpiresAt,
        });

        return axios(originalRequest);
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
<style lang="scss" scoped>
@import "../sass/_variables.scss";
@import "../sass/_mixins.scss";
.seed-container {
  position: relative;
  z-index: 10;
  .seed-toggle {
    position: relative;
    top: -4px;
    background: $green;
    padding: 0.3rem 0.5rem;
    border: 1px solid $green;
    color: #fff;
  }
  .seeds {
    padding: 0.6rem;
    border: 1px solid $green;
    background: rgba(30, 215, 96, 0.5);
    position: relative;
    padding-bottom: 0;
  }
}
.playlists-container {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-direction: row;
  flex-wrap: nowrap;
}
.showing-info {
  margin-top: 1rem;
  @include yiq-color(#000);
  text-align: center;
}
</style>
<template>
  <div class="track">
    <img class="track-bg" src="/images/spotify-logo.png" />
    <div class="track-info">
      <div class="album-image">
        <img class="media-object" width="64" v-bind:src="track.albumImage" />
      </div>
      <div class="details">
        <div>
          <h4 class="text-overflow" :title="track.name">{{track.name}}</h4>
          <h5 class="text-overflow" :title="track.album.name">{{track.album.name}}</h5>
          <b>Artists</b>
          <small class="text-overflow" :title="track.artists">{{track.artists}}</small>
          <br />
          <b>Length</b>
          <span>{{track.duration}}</span>
        </div>
      </div>
    </div>
    <div>
      <div class="player">
        <audio controls v-if="track.preview_url">
          <source :src="track.preview_url" type="audio/mpeg" />
        </audio>
        <em v-if="!track.preview_url">Preview missing...</em>
      </div>
      <div class="actions">
        <button
          class="btn"
          @click="addToPlaylist($event)"
          :data-trackuri="track.uri"
          :class="{'in-progress': addInProgress, 'btn-dark': inPlaylist, 'btn-success': !inPlaylist}"
          :disabled="addDisabled || inPlaylist"
        >{{(inPlaylist || addDisabled ? 'In playlist' : 'Add to playlist')}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import SpotifyService from "../services/spotifyService";
import GlobalEventsService from "../services/globalEventsService";
export default {
  name: "spotify-track",
  props: {
    track: Object,
    playlistTrackIds: Array,
    playlistId: String,
    accessToken: String,
  },
  data: function () {
    return {
      addInProgress: false,
      addDisabled: false,
      inPlaylist: false,
    };
  },
  watch: {
    playlistTrackIds: function (newVal, oldVal) {
      const tracks = this.playlistTrackIds.find((id) => id === this.track.id);
      this.inPlaylist = tracks && tracks.length !== 0;
    },
  },
  mounted: function () {
    const tracks = this.playlistTrackIds.find((id) => id === this.track.id);
    this.inPlaylist = tracks && tracks.length !== 0;
  },
  methods: {
    async addToPlaylist(evt) {
      evt.preventDefault();

      this.addInProgress = true;
      var response = await SpotifyService.addTrackToPlaylist(
        this.accessToken,
        this.playlistId,
        this.track.uri
      );
      this.addInProgress = false;

      if (response) {
        this.$emit("track:added", this.track);
        GlobalEventsService.dispatch("alert:home", {
          severity: "success",
          message: `The track '${this.track.name}' has been added to the playlist`,
          timeout: 2000,
        });
      } else {
        GlobalEventsService.dispatch("alert:home", {
          severity: "warning",
          message: `Failed to add the track '${this.track.name}'to the playlist, try again or not...`,
          timeout: 4000,
        });
      }

      this.addDisabled = response;
    },
  },
};
</script>

<style lang="scss" scoped>
.track {
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 0px 5px 0px;
  padding: 1rem;
  width: 100%;
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid olive;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  margin: 1rem 1rem 0 0;

  &.semi-visible {
    opacity: 0.7;
  }

  @media only screen and (min-width: 767px) {
    width: 47%;
  }

  @media only screen and (min-width: 1024px) {
    width: 31%;
  }

  .track-bg {
    position: absolute;
    height: 100%;
    right: -10rem;
    opacity: 0.4;
    top: 0;
    z-index: 1;
  }

  .track-info {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;

    .details {
      flex: 1 auto;

      h4,
      h5 {
        margin-top: 0;
        width: 230px;
      }

      h4 {
        font-size: 1.2em;
      }
      h5 {
        &.text-overflow {
          font-size: 0.85em;
        }
      }
      small {
        &.text-overflow {
          display: inline-block;
          width: 180px;
          vertical-align: middle;
        }
      }
    }

    .album-image {
      margin-right: 1rem;
    }
  }

  .player {
    position: relative;
    z-index: 3;
  }

  .actions {
    margin-top: 1rem;
  }
}
</style>
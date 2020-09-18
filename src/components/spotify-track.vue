<template>
  <div class="track">
    <img class="track-bg" src="/images/spotify-logo.png" />
    <div class="track-info">
      <div class="album-image">
        <img class="media-object" width="64" v-bind:src="track.albumImage" />
      </div>
      <div class="details">
        <div>
          <h4>{{track.name}}</h4>
          <h5>{{track.album.name}}</h5>
          <b>Artists</b>
          <small>{{track.artists}}</small>
        </div>
        <div>
          <b>Length</b>
          <span>{{track.duration}}</span>
        </div>
      </div>
    </div>
    <div>
      <div class="player">
        <audio controls v-if="track.preview_url">
          <source v-bind:src="track.preview_url" type="audio/mpeg" />
        </audio>
        <em v-if="!track.preview_url">Preview missing...</em>
      </div>
      <div class="actions">
        <button
          class="btn btn-success"
          v-on:click="addToPlaylist($event)"
          v-bind:data-trackuri="track.uri"
          v-bind:class="{'in-progress': addInProgress}"
          v-bind:disabled="addDisabled || inPlaylist"
        >{{(inPlaylist ? 'Already added' : addDisabled ? 'Added' : 'Add to playlist')}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import SpotifyService from "../services/spotifyService";
export default {
  name: "spotify-track",
  props: {
    track: Object,
    playlistTracks: Array,
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
    playlistTracks: function (newVal, oldVal) {
      const tracks = this.playlistTracks.find(
        (t) => t.track.id === this.track.id
      );
      this.inPlaylist = tracks && tracks.length !== 0;
    },
  },
  mounted: function () {
    const tracks = this.playlistTracks.find(
      (t) => t.track.id === this.track.id
    );
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

  @media only screen and (min-width: 767px) {
    width: 47%;
  }

  @media only screen and (min-width: 1024px) {
    width: 31%;
  }

  h4,
  h5 {
    margin-top: 0;
  }

  h4 {
    font-size: 1.3em;
  }

  .track-bg {
    position: absolute;
    height: 100%;
    right: -15rem;
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
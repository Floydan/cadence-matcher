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
          <span>{{track.artists}}</span>
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

<style scoped>
</style>
<template>
  <modal class="add-playlist" :show-modal="show" @close="playlistModalClosed">
    <template v-slot:header>
      <div class="h4">Add playlist</div>
    </template>
    <template v-slot:body>
      <div class="form">
        <div class="form-group">
          <label for="name">
            <b>Name:</b>
          </label>
          <input
            id="name"
            type="text"
            v-model="name"
            placeholder="Playlist name"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="description">
            <b>Description:</b>
          </label>
          <textarea
            id="description"
            type="text"
            v-model="description"
            placeholder="Description"
            class="form-control"
          />
        </div>
        <div class="form-check">
          <input
            id="isPublic"
            type="checkbox"
            v-model="isPublic"
            placeholder="Playlist name"
            class="form-check-input"
          />
          <label class="form-check-label" for="isPublic">Public</label>
        </div>
      </div>
      <div class="error">{{error}}</div>
    </template>
    <template v-slot:footer>
      <button class="btn btn-light" @click="playlistModalClosed">Cancel</button>
      <button class="btn btn-success" @click="createPlaylist">Create</button>
    </template>
  </modal>
</template>
<script>
import modal from "../components/modal.vue";
import spotifyService from "../services/spotifyService";
export default {
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    accessToken: String,
    userId: String,
  },
  data: function () {
    return {
      show: false,
      name: "",
      description: "",
      isPublic: true,
      error: "",
    };
  },
  components: {
    modal: modal,
  },
  methods: {
    playlistModalClosed() {
      this.show = false;
      this.$emit("close:playlist");
      this.reset();
    },
    async createPlaylist() {
      const result = await spotifyService.createPlaylist(
        this.accessToken,
        this.userId,
        {
          name: this.name,
          description: this.description,
          isPublic: this.isPublic,
        }
      );

      if (result.success) {
        this.show = false;
        this.$emit("added:playlist", result.data); //add playlist to event data
        this.$emit("close:playlist");
        this.reset();
      } else {
        this.error = result.data;
      }
    },
    reset() {
      this.name = "";
      this.description = "";
      this.isPublic = true;
      this.error = "";
    },
  },
  watch: {
    showModal: function (newVal, oldVal) {
      this.show = newVal;
    },
  },
};
</script>
<style lang="scss">
.add-playlist {
  .modal-header {
    background: #1ed760;

    > .h4 {
      margin-bottom: 0;
    }
  }
}
</style>
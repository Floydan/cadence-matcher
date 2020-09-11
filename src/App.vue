<template>
  <div class="container" id="app">
    <router-view />
  </div>
</template>

<script>
import "vue-slider-component/theme/default.css";
import "./sass/main.scss";

import axios from "axios";
import Utilities from "./utilities";

export default {
  data: () => {
    return {
      year: String,
    };
  },
  components: {},
  beforeMount() {
    this.year = new Date().getFullYear();
  },
};
</script>

<style lang="scss">
</style>
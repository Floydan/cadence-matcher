<template>
  <div id="app">
    <nav-bar></nav-bar>
    <alerts :alert-types="['alert:global']"></alerts>
    <div class="container">
      <router-view />
    </div>
    <footer>
      <div class="container">&copy; Copyright Joakim Höglund {{year}}</div>
    </footer>
  </div>
</template>

<script>
import "vue-slider-component/theme/default.css";
import "./sass/main.scss";
import alerts from "./components/alerts.vue";

import axios from "axios";
import Utilities from "./utilities";

export default {
  data: () => {
    return {
      year: String,
    };
  },
  components: {
    alerts,
  },
  beforeMount() {
    this.year = new Date().getFullYear();
  },
};
</script>

<style lang="scss">
footer {
  margin-top: 10rem;
  padding-bottom: 5rem;
  color: #fff;
}
</style>
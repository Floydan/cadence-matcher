<template>
  <div class="main-navigation">
    <nav class="container">
      <ul>
        <li>
          <router-link :key="$route.fullPath" to="/">Home</router-link>
        </li>
        <li>
          <router-link :key="$route.fullPath" to="/about">About</router-link>
        </li>
        <li class="login-logout">
          <a href="#" :key="$route.fullPath" @click="logout" v-if="isLoggedIn">Log out</a>
          <router-link :key="$route.fullPath" to="/login" v-if="!isLoggedIn">Login</router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>
<script>
import storageService from "../services/storageService";

export default {
  methods: {
    data: function () {
      return {
        isLoggedIn: Boolean,
      };
    },
    logout() {
      this.accessToken = "";
      this.refreshToken = "";
      this.user = {};

      storageService.clearTokens();
      this.$router.push("/login");
      return;
    },
  },
  created() {
    this.isLoggedIn = isLoggedIn();
  },
  updated() {
    this.isLoggedIn = isLoggedIn();
  },
  mounted() {
    this.isLoggedIn = isLoggedIn();
  },
};

function isLoggedIn() {
  var tokens = storageService.getTokens();
  if (!tokens || !tokens.accessToken) return false;

  return new Date(tokens.expire) > new Date();
}
</script>
<style lang="scss" scoped>
@import "../sass/_mixins";

.main-navigation {
  @include yiq-contrasted($green);
  font-size: 1.2em;
  ul {
    list-style: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    margin: 0;
    padding: 0;

    li {
      padding: 1rem 2rem;
      flex: 0 auto;

      &:first-child {
        padding-left: 0;
      }

      &.login-logout {
        cursor: pointer;
        flex: 1 auto;
        text-align: right;
      }

      a {
        text-decoration: none;
        font-weight: bold;
        @include yiq-color($green);

        &.router-link-exact-active {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
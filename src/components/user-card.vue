<template>
  <div id="user-profile" v-if="user && user.display_name">
    <div class="media">
      <img
        class="mr-2"
        width="100"
        v-if="user.images && user.images.length !== 0"
        v-bind:src="user.images['0'].url"
      />
      <div class="media-body">
        <h1>{{user.display_name}}</h1>
        <div class="text-truncate">{{user.email}}</div>
        <div>
          <img :src="`https://www.countryflags.io/${user.country}/flat/32.png`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "user-card",
  props: ["user"],
};
</script>

<style lang="scss" scoped>
#user-profile {
  margin-top: 2rem;

  h1 {
    font-family: Roboto, sans-serif;
    font-size: 1.8em;
    margin-bottom: 0.1rem;
  }
  .media-body {
    width: 57vw;
  }
}
</style>
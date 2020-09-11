<template>
  <div id="user-profile">
    <h1>Logged in as {{user.display_name}}</h1>
    <div class="media">
      <div class="pull-left">
        <img class="media-object" width="150" v-bind:src="user.images['0'].url" />
      </div>
      <div class="media-body">
        <dl class="dl-horizontal">
          <dt>Display name</dt>
          <dd class="clearfix">{{user.display_name}}</dd>
          <dt>Id</dt>
          <dd>{{user.id}}</dd>
          <dt>Email</dt>
          <dd>{{user.email}}</dd>
          <dt>Spotify URI</dt>
          <dd>
            <a v-bind:href="user.external_urls.spotify">{{user.external_urls.spotify}}</a>
          </dd>
          <dt>Link</dt>
          <dd>
            <a v-bind:href="user.href">{{user.href}}</a>
          </dd>
          <dt>Country</dt>
          <dd>{{user.country}}</dd>
        </dl>
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

<style lang="scss">
.user-profile {
  h1 {
    font-family: Roboto, sans-serif;
  }
}
</style>
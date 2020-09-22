<template>
  <div class="alerts" @alert="alert">
    <div
      v-for="(alert, i) in alerts"
      :class="`alert alert-${alert.severity}`"
      role="alert"
      :key="`alert-${i}`"
    >
      {{alert.message}}
      <button
        type="button"
        class="close pl-2 pr-2"
        data-dismiss="alert"
        aria-label="Close"
        @click="remove(i);"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    alertTypes: {
      type: Array,
      default: [],
    },
  },
  data: function () {
    return {
      alerts: [],
    };
  },
  mounted() {
    for (var t of this.alertTypes) {
      window["document"].addEventListener(t, this.alert);
    }
  },
  beforeDestroy() {
    for (var t of this.alertTypes) {
      window["document"].removeEventListener(t, this.alert);
    }
  },
  methods: {
    alert: function (evt) {
      this.alerts.splice(0, 0, evt.detail);
      this.timedRemove();
    },
    remove: function (index) {
      this.alerts.splice(index, 1);
    },
    timedRemove() {
      setTimeout(() => {
        this.alerts.splice(this.alerts.length - 1, 1);
      }, 10000);
    },
  },
};
</script>
<style lang="scss" scoped>
.alerts {
  position: fixed;
  width: 100%;
  padding: 1rem;
  left: 0;
  .alert {
    transition: opacity 2s;
  }
}
</style>
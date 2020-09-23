<template>
  <div v-if="alerts.length > 0" class="alerts drop-shadow" @alert="alert">
    <div
      v-for="(alert, i) in alerts"
      :class="`alert alert-${alert.severity}`"
      role="alert"
      :key="`alert-${i}`"
    >
      <!-- <i :class="severityIcon(alert)"></i> -->
      <span class="icon" :class="alert.severity"></span>
      <span class="message">{{alert.message}}</span>
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
      const alert = evt.detail;
      alert.id = uuidv4();
      alert.timeout = alert.timeout || 3000;
      this.alerts.splice(0, 0, evt.detail);
      alert.timer = setTimeout(() => {
        this.alerts = this.alerts.filter((a) => a.id !== alert.id);
      }, alert.timeout);
    },
    remove: function (index) {
      clearTimeout(this.alerts[index].timeout);
      this.alerts.splice(index, 1);
    },
    severityIcon(alert) {
      return {
        "far fa-thumbs-up": alert.severity === "success",
        "fas fa-exclamation-triangle": alert.severity === "warning",
        "fas fa-info": alert.severity === "info",
        "far fa-thumbs-down": alert.severity === "danger",
      };
    },
  },
};
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
</script>
<style lang="scss" scoped>
@font-face {
  font-weight: normal;
  font-style: normal;
  font-family: "icomoon";
  src: url("../assets/fonts/icomoon/icomoon.eot");
  src: url("../assets/fonts/icomoon/icomoon.eot?#iefix")
      format("embedded-opentype"),
    url("../assets/fonts/icomoon/icomoon.ttf") format("truetype"),
    url("../assets/fonts/icomoon/icomoon.woff") format("woff"),
    url("../assets/fonts/icomoon/icomoon.svg#icomoon") format("svg");
}

.alerts {
  position: fixed;
  width: 100%;
  padding: 1rem;
  left: 0;
  top: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  .alert {
    transition: opacity 2s;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .icon {
      &::before {
        font-family: "icomoon";
        margin-right: 1rem;
      }
      &.success::before {
        content: "\e600"; /* Checkmark for success */
      }
      &.danger::before {
        content: "\e601"; /* Cross for error */
      }
      &.warning::before {
        content: "\e601"; /* Cross for error */
      }
    }
    .close {
      flex-grow: 1;
      text-align: end;
    }
  }
}
</style>
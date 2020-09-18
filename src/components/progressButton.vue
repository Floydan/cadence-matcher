<template>
  <button
    class="progress-button"
    :class="{ 'state-loading': loading, 'state-error': status < 0, 'state-success': status > 0 }"
    :disabled="isDisabled"
    :data-style="buttonStyle"
    :data-horizontal="horizontal"
    :data-vertical="vertical"
    :data-perspective="perspective"
    @click="start()"
  >
    <span v-if="!perspective" class="content">
      <slot />
    </span>
    <span v-if="!perspective" class="pb-progress">
      <span class="progress-inner" :class="{ 'notransition': !this.loading }"></span>
    </span>
    <span v-if="perspective" class="progress-wrap">
      <span class="content">
        <slot />
      </span>
      <span class="pb-progress">
        <span class="progress-inner" :class="{ 'notransition': !this.loading }"></span>
      </span>
    </span>
  </button>
</template>
<script>
export default {
  name: "progress-button",
  props: {
    buttonStyle: String,
    horizontal: Boolean,
    vertical: Boolean,
    disabled: Boolean,
    perspective: Boolean,
    statusTime: {
      type: Number,
      default: 0,
    },
    action: {
      type: Function,
    },
    duration: {
      type: Number,
      default: 2000,
    },
  },
  data: function () {
    return {
      progressProp: String,
      loading: false,
      progressElement: HTMLSpanElement,
      isDisabled: this.disabled,
      timer: null,
      percent: 0,
      steps: 200,
      status: 0,
    };
  },
  computed: {
    intervalDuration() {
      return this.duration / this.steps;
    },
  },
  beforeMount() {
    if (this.horizontal) this.progressProp = "width";
    else if (this.vertical) this.progressProp = "height";
    if (!this.buttonStyle) this.buttonStyle = "fill";
    if (!this.horizontal && !this.vertical) this.horizontal = true;
  },
  mounted() {
    this.progressElement = this.$el.getElementsByClassName("progress-inner")[0];
  },
  methods: {
    start() {
      this.reset();
      this.isDisabled = false;
      this.loading = true;
      this.status = 0;
      setTimeout(
        async () => {
          this.timer = setInterval(() => {
            // increase by with random value
            this.increase(Math.random());
            if (this.percent >= 100) {
              if (!this.action) this.setProgress(0);
              else this.stop(0);
            }
          }, this.intervalDuration);

          if (this.action) await this.action(this);
        },
        this.buttonStyle === "fill" ||
          this.buttonStyle === "top-line" ||
          this.buttonStyle === "lateral-lines"
          ? 0
          : 200
      );
    },
    stop(result) {
      this.setProgress(100);

      setTimeout(() => {
        clearTimeout(this.timer);
        this.reset(result);
      }, 750);
    },
    reset(result) {
      this.isDisabled = false;
      this.loading = false;
      this.setProgress(0);
      if (typeof result === "number") this.status = result;

      setTimeout(() => {
        if (typeof result === "number") {
          this.status = 0;
        }
      }, 1500);
    },
    increase(amount) {
      this.setProgress(this.percent + amount);
    },
    decrease(amount) {
      this.setProgress(this.percent - amount);
    },
    setProgress(val) {
      this.percent = Math.round(val);
      this.progressElement.style[this.progressProp] = `${this.percent}%`;
    },
  },
};
</script>
<style lang="scss" scoped>
@font-face {
  font-weight: normal;
  font-style: normal;
  font-family: "icomoon";
  src: url("../fonts/icomoon/icomoon.eot");
  src: url("../fonts/icomoon/icomoon.eot?#iefix") format("embedded-opentype"),
    url("../fonts/icomoon/icomoon.ttf") format("truetype"),
    url("../fonts/icomoon/icomoon.woff") format("woff"),
    url("../fonts/icomoon/icomoon.svg#icomoon") format("svg");
}

/* General styles for all types of buttons */
.progress-button {
  position: relative;
  display: inline-block;
  padding: 0 60px;
  outline: none;
  border: none;
  background: #1d9650;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 1em;
  line-height: 4;
  white-space: nowrap;
  width: 100%;
}

.progress-button[disabled],
.progress-button[disabled].state-loading {
  cursor: default;
}

.progress-button .content {
  position: relative;
  display: block;
}

.progress-button .content::before,
.progress-button .content::after {
  position: absolute;
  right: 20px;
  color: #0e7138;
  font-family: "icomoon";
  opacity: 0;
  -webkit-transition: opacity 0.3s 0.3s;
  transition: opacity 0.3s 0.3s;
}

.progress-button .content::before {
  content: "\e600"; /* Checkmark for success */
}

.progress-button .content::after {
  content: "\e601"; /* Cross for error */
}

.progress-button.state-success .content::before,
.progress-button.state-error .content::after {
  opacity: 1;
}

.notransition {
  -webkit-transition: none !important;
  transition: none !important;
}

.progress-button .pb-progress {
  background: #148544;
}

.progress-button .progress-inner {
  position: absolute;
  left: 0;
  background: rgba(25, 25, 25, 0.5);
}

.progress-button[data-horizontal] .progress-inner {
  top: 0;
  width: 0;
  height: 100%;
  -webkit-transition: width 0.3s, opacity 0.3s;
  transition: width 0.3s, opacity 0.3s;
}

.progress-button[data-vertical] .progress-inner {
  bottom: 0;
  width: 100%;
  height: 0;
  -webkit-transition: height 0.3s, opacity 0.3s;
  transition: height 0.3s, opacity 0.3s;
}

/* Necessary 3d styles for buttons with perspective */

.progress-button[data-perspective] {
  position: relative;
  display: inline-block;
  padding: 0;
  background: transparent;
  -webkit-perspective: 900px;
  perspective: 900px;
}

.progress-button[data-perspective] .content {
  padding: 0 60px;
  background: #1d9650;
}

.progress-button[data-perspective] .progress-wrap {
  display: block;
  -webkit-transition: -webkit-transform 0.2s;
  transition: transform 0.2s;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.progress-button[data-perspective] .content,
.progress-button[data-perspective] .pb-progress {
  outline: 1px solid rgba(0, 0, 0, 0); /* Smoothen jagged edges in FF */
}

/* Individual styles */
/* Choose the effect(s) you want, delete the rest */

/* fill horizontal */
/* ====================== */

.progress-button[data-style="fill"][data-horizontal] {
  overflow: hidden;
}

.progress-button[data-style="fill"][data-horizontal] .content {
  z-index: 10;
  -webkit-transition: -webkit-transform 0.3s;
  transition: transform 0.3s;
}

.progress-button[data-style="fill"][data-horizontal] .content::before,
.progress-button[data-style="fill"][data-horizontal] .content::after {
  top: 100%;
  right: auto;
  left: 50%;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.progress-button[data-style="fill"][data-horizontal].state-success .content,
.progress-button[data-style="fill"][data-horizontal].state-error .content {
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
}

/* fill vertical */
/* ====================== */

.progress-button[data-style="fill"][data-vertical] {
  overflow: hidden;
}

.progress-button[data-style="fill"][data-vertical] .content {
  z-index: 10;
  -webkit-transition: -webkit-transform 0.3s;
  transition: transform 0.3s;
}

.progress-button[data-style="fill"][data-vertical] .content::before,
.progress-button[data-style="fill"][data-vertical] .content::after {
  top: 100%;
  right: auto;
  left: 50%;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.progress-button[data-style="fill"][data-vertical].state-success .content,
.progress-button[data-style="fill"][data-vertical].state-error .content {
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
}

/* Shrink horizontal */
/* ====================== */

.progress-button[data-style="shrink"] {
  /* common for horizontal and vertical */
  overflow: hidden;
  -webkit-transition: -webkit-transform 0.2s;
  transition: transform 0.2s;
}

.progress-button[data-style="shrink"][data-horizontal] .content {
  -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
  transition: opacity 0.3s, transform 0.3s;
}

.progress-button[data-style="shrink"][data-horizontal] .content::before,
.progress-button[data-style="shrink"][data-horizontal] .content::after {
  top: 100%;
  right: auto;
  left: 50%;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.progress-button[data-style="shrink"][data-horizontal].state-loading {
  -webkit-transform: scaleY(0.3);
  transform: scaleY(0.3);
}

.progress-button[data-style="shrink"][data-horizontal].state-loading .content {
  opacity: 0;
}

.progress-button[data-style="shrink"][data-horizontal].state-success .content,
.progress-button[data-style="shrink"][data-horizontal].state-error .content {
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
}

/* Shrink vertical */
/* ====================== */

.progress-button[data-style="shrink"][data-vertical] .content {
  -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
  transition: opacity 0.3s, transform 0.3s;
}

.progress-button[data-style="shrink"][data-vertical] .content::before,
.progress-button[data-style="shrink"][data-vertical] .content::after {
  top: 100%;
  right: auto;
  left: 50%;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.progress-button[data-style="shrink"][data-vertical].state-loading {
  -webkit-transform: scaleX(0.1);
  transform: scaleX(0.1);
}

.progress-button[data-style="shrink"][data-vertical].state-loading .content {
  opacity: 0;
}

.progress-button[data-style="shrink"][data-vertical].state-success .content,
.progress-button[data-style="shrink"][data-vertical].state-error .content {
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
}

/* Rotate bottom 3d */
/* ====================== */

.progress-button[data-style="rotate-angle-bottom"] .pb-progress {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 20px;
  box-shadow: 0 -1px 0 #148544; /* fix the blurriness that causes a gap */
  -webkit-transform: rotateX(-90deg);
  transform: rotateX(-90deg);
  -webkit-transform-origin: 50% 0%;
  transform-origin: 50% 0%;
}

.progress-button[data-style="rotate-angle-bottom"].state-loading
  .progress-wrap {
  -webkit-transform: rotateX(45deg);
  transform: rotateX(45deg);
}

/* Rotate top 3d */
/* ====================== */

.progress-button[data-style="rotate-angle-top"] .pb-progress {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  height: 20px;
  box-shadow: 0 1px 0 #148544; /* fix the blurriness that causes a gap */
  -webkit-transform: rotateX(90deg);
  transform: rotateX(90deg);
  -webkit-transform-origin: 50% 100%;
  transform-origin: 50% 100%;
}

.progress-button[data-style="rotate-angle-top"].state-loading .progress-wrap {
  -webkit-transform: rotateX(-45deg);
  transform: rotateX(-45deg);
}

/* Rotate left 3d */
/* ====================== */

.progress-button[data-style="rotate-angle-left"] .pb-progress {
  position: absolute;
  top: 0;
  right: 100%;
  width: 20px;
  height: 100%;
  box-shadow: 1px 0 0 #148544; /* fix the blurriness that causes a gap */
  -webkit-transform: rotateY(-90deg);
  transform: rotateY(-90deg);
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
}

.progress-button[data-style="rotate-angle-left"].state-loading .progress-wrap {
  -webkit-transform: rotateY(45deg);
  transform: rotateY(45deg);
}

/* Rotate right 3d */
/* ====================== */

.progress-button[data-style="rotate-angle-right"] .pb-progress {
  position: absolute;
  top: 0;
  left: 100%;
  width: 20px;
  height: 100%;
  box-shadow: -1px 0 0 #148544; /* fix the blurriness that causes a gap */
  -webkit-transform: rotateY(90deg);
  transform: rotateY(90deg);
  -webkit-transform-origin: 0% 50%;
  transform-origin: 0% 50%;
}

.progress-button[data-style="rotate-angle-right"].state-loading .progress-wrap {
  -webkit-transform: rotateY(-45deg);
  transform: rotateY(-45deg);
}

/* Rotate side down 3d */
/* ====================== */

.progress-button[data-style="rotate-side-down"] .pb-progress {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 20px;
  -webkit-transform: rotateX(-90deg);
  transform: rotateX(-90deg);
  -webkit-transform-origin: 50% 0%;
  transform-origin: 50% 0%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.progress-button[data-style="rotate-side-down"].state-loading .progress-wrap {
  -webkit-transform: rotateX(90deg) translateZ(10px);
  transform: rotateX(90deg) translateZ(10px);
}

/* Rotate side up 3d */
/* ====================== */

.progress-button[data-style="rotate-side-up"] .pb-progress {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  height: 20px;
  -webkit-transform: rotateX(90deg);
  transform: rotateX(90deg);
  -webkit-transform-origin: 50% 100%;
  transform-origin: 50% 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.progress-button[data-style="rotate-side-up"].state-loading .progress-wrap {
  -webkit-transform: rotateX(-90deg) translateZ(10px);
  transform: rotateX(-90deg) translateZ(10px);
}

/* Rotate side left 3d */
/* ====================== */

.progress-button[data-style="rotate-side-left"] .progress-wrap {
  -webkit-transform-origin: 0 50%;
  transform-origin: 0 50%;
}

.progress-button[data-style="rotate-side-left"] .pb-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 100%;
  -webkit-transform: rotateY(90deg);
  transform: rotateY(90deg);
  -webkit-transform-origin: 0 50%;
  transform-origin: 0 50%;
}

.progress-button[data-style="rotate-side-left"].state-loading .progress-wrap {
  -webkit-transform: translateX(50%) rotateY(90deg) translateZ(10px);
  transform: translateX(50%) rotateY(90deg) translateZ(10px);
}

/* Rotate side right 3d */
/* ====================== */

.progress-button[data-style="rotate-side-right"] .progress-wrap {
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
}

.progress-button[data-style="rotate-side-right"] .pb-progress {
  position: absolute;
  top: 0;
  left: 100%;
  width: 20px;
  height: 100%;
  -webkit-transform: rotateY(90deg);
  transform: rotateY(90deg);
  -webkit-transform-origin: 0 50%;
  transform-origin: 0 50%;
}

.progress-button[data-style="rotate-side-right"].state-loading .progress-wrap {
  -webkit-transform: translateX(-50%) rotateY(-90deg) translateZ(10px);
  transform: translateX(-50%) rotateY(-90deg) translateZ(10px);
}

/* Rotate back 3d */
/* ====================== */

.progress-button[data-style="rotate-back"] .progress-wrap {
  -webkit-transition-timing-function: ease-out;
  transition-timing-function: ease-out;
}

.progress-button[data-style="rotate-back"] .content {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.progress-button[data-style="rotate-back"] .pb-progress {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-transform: rotateX(-180deg);
  transform: rotateX(-180deg);
  -webkit-transform-origin: 50% 0%;
  transform-origin: 50% 0%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.progress-button[data-style="rotate-back"].state-loading .progress-wrap {
  -webkit-transform: rotateX(180deg) scaleX(0.6) scaleY(0.3);
  transform: rotateX(180deg) scaleX(0.6) scaleY(0.3);
}

/* flip open 3d */
/* ====================== */

.progress-button[data-style="flip-open"] .content {
  z-index: 10;
  -webkit-transition: -webkit-transform 0.2s;
  transition: transform 0.2s;
  -webkit-transform-origin: 50% 0;
  transform-origin: 50% 0;
}

.progress-button[data-style="flip-open"] .pb-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.progress-button[data-style="flip-open"].state-loading .content {
  -webkit-transform: rotateX(45deg);
  transform: rotateX(45deg);
}

/* slide down */
/* ====================== */

.progress-button[data-style="slide-down"] {
  padding: 0;
  overflow: visible;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.progress-button[data-style="slide-down"] .content {
  z-index: 10;
  padding: 0 60px;
  background: #1d9650;
}

.progress-button[data-style="slide-down"] .pb-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-transition: -webkit-transform 0.2s;
  transition: transform 0.2s;
}

.progress-button[data-style="slide-down"].state-loading .pb-progress {
  -webkit-transform: translateY(10px);
  transform: translateY(10px);
}

/* move-up */
/* ====================== */

.progress-button[data-style="move-up"] {
  padding: 0;
  overflow: visible;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.progress-button[data-style="move-up"] .content {
  z-index: 10;
  padding: 0 60px;
  background: #1d9650;
  -webkit-transition: -webkit-transform 0.2s;
  transition: transform 0.2s;
}

.progress-button[data-style="move-up"] .pb-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.progress-button[data-style="move-up"].state-loading .content {
  -webkit-transform: translateY(-10px);
  transform: translateY(-10px);
}

/* top-line */
/* ====================== */

.progress-button[data-style="top-line"] .progress-inner {
  height: 3px;
}

.progress-button[data-style="top-line"] .content::before,
.progress-button[data-style="top-line"] .content::after {
  right: auto;
  left: 100%;
  margin-left: 25px;
}

/* lateral-lines */
/* ====================== */

.progress-button[data-style="lateral-lines"] .progress-inner {
  width: 100%;
  border-right: 3px solid #0e7138;
  border-left: 3px solid #0e7138;
  background: transparent;
}

.progress-button[data-style="lateral-lines"] .content::before,
.progress-button[data-style="lateral-lines"] .content::after {
  right: auto;
  left: 100%;
  margin-left: 25px;
}
</style>
import Vue from 'vue';
import App from './App.vue';
import router from './router';

import navBar from "./components/nav-bar.vue";

Vue.config.productionTip = false;

Vue.component('nav-bar', navBar);

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
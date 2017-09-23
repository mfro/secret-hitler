import Vue from 'vue'
import App from './App.vue'

import store from './store';

import './socket';
import './uikit';

new Vue({
  el: '#app',
  store: store,
  render: h => h(App)
});

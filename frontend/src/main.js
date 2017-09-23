import Vue from 'vue'
import App from './App.vue'

import store from './store';
import './socket';

new Vue({
  el: '#app',
  store: store,
  render: h => h(App)
})

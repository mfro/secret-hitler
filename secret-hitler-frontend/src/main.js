import Vue from 'vue'
import App from './App.vue'

import store from './store';
import * as cards from './cards';
import * as socket from './socket';

import './uikit';
import extend from '@mfro/promise-extensions';

extend(Promise);

Vue.prototype.$send = function (name, args) {
    socket.send(name, args);
};

new Vue({
    el: '#app',
    store: store,
    render: h => h(App)
});

window.socket = socket;

cards.load();
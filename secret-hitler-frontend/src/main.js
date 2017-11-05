import Vue from 'vue'
import App from './App.vue'

import store from './store';
import * as socket from './socket';

import './uikit';

const debug = false;

Vue.prototype.$send = function (name, args) {
    if (debug) {
        console.log(name, args);
    } else {
        socket.send(name, args);
    }
};

new Vue({
    el: '#app',
    store: store,
    render: h => h(App)
});

if (debug) {
    require('./store/debug');
}

window.socket = socket;

import Vue from 'vue'
import App from './App.vue'

import store from './store';
import router from './router';
import * as cards from './cards';
import * as socket from './socket';

import './debug';
import './uikit';
import extend from '@mfro/promise-extensions';

extend(Promise);

Vue.prototype.$send = function (name, args) {
    socket.send(name, args);
};

new Vue({
    el: '#app',
    store: store,
    router: router,
    render: h => h(App)
});

router.push('/');

window.socket = socket;

cards.load();

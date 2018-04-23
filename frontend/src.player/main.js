import Vue from 'vue'
import App from './ui/App.vue'

import store from './store';
import router from './router';

import * as debug from '@/debug';
import * as socket from '@/socket';

import '@/init';
import '@/uikit';
import '@/assets';

debug.init(store);
socket.init(store);

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

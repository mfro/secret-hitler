import Vue from 'vue'
import App from './ui/App.vue'

import store from './store';
import router from './router';

import * as debug from '@/debug';
import * as socket from '@/socket';

import '@/uikit';
import '@/assets';
import extend from '@mfro/promise-extensions';

debug.init(store);
socket.init(store);

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

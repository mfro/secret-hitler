import Vue from 'vue'
import App from './ui/App.vue'

import store from './store';

import * as debug from '@/debug';
import * as socket from '@/socket';

import '@/init';
import './uikit';
import '@/assets';
import extend from '@mfro/promise-extensions';

debug.init(store);
socket.init(store);

extend(Promise);

new Vue({
    el: '#app',
    store: store,
    render: h => h(App)
});

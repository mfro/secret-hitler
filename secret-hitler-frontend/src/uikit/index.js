import './fonts.less';

import Vue from 'vue';

const context = require.context('.', true, /\.vue$/);

for (let key of context.keys()) {
    let split = key.split(/\.|\//).filter(f => f);
    let name = split[0];
    let component = context(key);

    Vue.component('uikit-' + name, component);
}
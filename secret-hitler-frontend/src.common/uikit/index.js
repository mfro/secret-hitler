import Components from './components';
import Directives from './directives';
import Style from './style';

import Vue from 'vue';

import Vuetify from 'vuetify';
import SpecificCSS from '@mfro/vue-specific-css';

Vue.use(Vuetify);
Vue.use(SpecificCSS);

// document.ontouchmove = function (event) {
//     event.preventDefault();
// }
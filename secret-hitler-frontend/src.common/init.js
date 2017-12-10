import Vue from 'vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

if (process.env.NODE_ENV != 'development') {
    Raven.config('https://fa95c43db8564b969540265a8aa66564@sentry.io/257051')
        .addPlugin(RavenVue, Vue)
        .install();
}

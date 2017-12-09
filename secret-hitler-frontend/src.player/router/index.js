import Vue from 'vue';
import VueRouter from 'vue-router';

import HomeView from '@player/ui/routes/HomeView';
import LogView from '@player/ui/routes/LogView';
import OptionsView from '@player/ui/routes/OptionsView';
import LogDetailsView from '@player/ui/routes/LogDetailsView';
import AssignmentView from '@player/ui/routes/AssignmentView';

const routes = [
    {
        path: '/options',
        component: OptionsView,
    },
    {
        path: '/role',
        component: AssignmentView,
    },
    {
        path: '/log/:index',
        component: LogDetailsView,
        props: true,
        meta: {
            back: '/log',
        }
    },
    {
        path: '/log',
        component: LogView,
    },
    {
        path: '/home',
        component: HomeView,
    },
    {
        path: '/',
        redirect: '/home',
    },
];

Vue.use(VueRouter);

export default new VueRouter({
    routes,
});

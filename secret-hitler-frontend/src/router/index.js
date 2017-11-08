import Vue from 'vue';
import VueRouter from 'vue-router';

import HomeView from './routes/HomeView';
import LogView from './routes/LogView';
import LogDetailsView from './routes/LogDetailsView';
import AssignmentView from './routes/AssignmentView';

const routes = [
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
        path: '/role',
        component: AssignmentView,
    },
    {
        path: '/',
        component: HomeView,
    },
];

Vue.use(VueRouter);

export default new VueRouter({
    routes,
});

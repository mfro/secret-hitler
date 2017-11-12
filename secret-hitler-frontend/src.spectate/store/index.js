import Vue from 'vue';
import Vuex from 'vuex';

import * as game from '@/store/game';
import * as connection from '@/store/connection';

const state = {
};

const getters = {
};

const mutations = {
};

const actions = {
    reset({ commit }) {
        commit('RESET_GAME');
        commit('RESET_CONNECTION');
    }
};

Vue.use(Vuex);

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    modules: {
        game,
        connection,
    }
});
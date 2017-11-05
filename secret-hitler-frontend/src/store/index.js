import Vue from 'vue';
import Vuex from 'vuex';

const state = {
    game: null,
    results: [],
};

const getters = {
    game(state) {
        return state.game;
    },

    results(state) {
        return state.results;
    },

    getPlayer: (state) => (id) => {
        if (!state.game) return null;
    
        return state.game.players.find(p => p.id == id);
    },

    localPlayer(state) {
        if (!state.game) return null;

        return state.game.players.find(p => p.isLocalPlayer);
    }
};

const mutations = {
    SET_GAME(state, value) {
        state.game = value;
    },

    POST_RESULT(state, value) {
        state.results.push(value);
    },

    POP_RESULT(state) {
        state.results.shift();
    }
};

const actions = {
};

Vue.use(Vuex);

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
});
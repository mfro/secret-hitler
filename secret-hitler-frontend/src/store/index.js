import Vue from 'vue';
import Vuex from 'vuex';

const state = {
    game: null,
    results: [],
    watching: false,
    connection: null,
};

const getters = {
    connection(state) {
        return state.connection;
    },

    isWatching(state) {
        return state.watching && state.game != null;
    },

    game(state) {
        return state.game;
    },

    results(state) {
        return state.results;
    },
    allPlayers() {
        return state.game && state.game.players.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    },

    getPlayer: (state, getters) => (id) => {
        if (!state.game) return null;

        return getters.allPlayers.find(p => p.id == id);
    },

    localPlayer(state, getters) {
        if (!state.game) return null;

        return getters.allPlayers.find(p => p.isLocalPlayer);
    }
};

const mutations = {
    RESET(state) {
        state.game = null;
        state.results = [];
        state.watching = false;
        state.connection = null;
    },

    SET_WATCHING(state, value) {
        state.watching = value;
    },

    SET_CONNECTION(state, value) {
        state.connection = value;
    },

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
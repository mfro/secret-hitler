import Vue from 'vue';
import Vuex from 'vuex';

const state = {
    self: null,
    players: null,
    assignment: null,
};

const getters = {
    self(state) {
        return state.self;
    },

    allPlayers(state) {
        return state.players;
    },

    assignment(state) {
        return state.assignment;
    },
};

const mutations = {
    setSelf(state, self) {
        state.self = self;
    },

    setPlayerList(state, list) {
        state.players = list;

        let self = list.find(p => p.id == state.self.id)
        state.self = self;
    },

    setAssignment(state, ass) {
        state.assignment = ass;
    },

    setReady(state, isReady) {
        if (!state.self)
            throw new Error('Invalid operation: no self');

        state.self = {
            id: state.self.id,
            name: state.self.name,
            isReady: isReady,
        };
    }
};

Vue.use(Vuex);

export default new Vuex.Store({
    state,
    getters,
    mutations,
});
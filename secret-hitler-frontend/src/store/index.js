import Vue from 'vue';
import Vuex from 'vuex';

const state = {
    self: null,
    players: null,
    assignment: { role: 'liberal', known: [] },

    isVoting: false,
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

    isVoting(state) {
        return state.isVoting;
    }
};

const mutations = {
    setSelf(state, self) {
        state.self = self;
    },

    setReady(state, isReady) {
        state.self.isReady = isReady;
    },

    setVoting(state, isVoting) {
        state.isVoting = isVoting;
    },

    setPlayerList(state, list) {
        state.players = list;

        let self = list.find(p => p.id == state.self.id)
        state.self = self;
    },

    setAssignment(state, ass) {
        state.assignment = ass;
    },

    reset(state) {
        state.self = null;
        state.players = null;
        state.assignment = null;
    }
};

const actions = {
    login(context, arg) {
        context.commit('setSelf', {
            name: arg.name
        });
    },

    setReady(context, isReady) {
        if (!state.self)
            throw new Error('Invalid operation: no self');

        context.commit('setReady', isReady);
    },

    setVoting(context, isVoting) {
        context.commit('setVoting', isVoting);
    },

    reset(context, isReady) {
        context.commit('reset');
    }
};

Vue.use(Vuex);

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
});
export const state = {
    game: null,
    results: [],
};

export const getters = {
    game(state) {
        return state.game;
    },

    results(state) {
        return state.results;
    },

    allPlayers(state) {
        if (!state.game)
            return null;

        if (state.game.state == 'LOBBY')
            return state.game.players.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

        return state.game.players.sort((a, b) => {
            return a.index - b.index;
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

export const mutations = {
    RESET_GAME(state) {
        state.game = null;
        state.results = [];
    },

    SET_GAME(state, value) {
        state.game = value;
    },

    POST_RESULT(state, value) {
        state.results.push(value);
    },

    POP_RESULT(state) {
        state.results.shift();
    },
};

export const actions = {
};

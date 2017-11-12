export const state = {
    connection: null,
};

export const getters = {
    connection(state) {
        return state.connection;
    },
};

export const mutations = {
    RESET_CONNECTION(state) {
        state.connection = null;
    },

    SET_CONNECTION(state, value) {
        state.connection = value;
    },
};

export const actions = {
};

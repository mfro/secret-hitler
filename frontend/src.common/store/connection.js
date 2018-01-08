export const state = {
    error: null,
    connection: null,
};

export const getters = {
    error(state) {
        return state.error;
    },
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

    SET_ERROR(state, value) {
        state.error = value;
    },
};

export const actions = {
};

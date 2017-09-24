<template>
    <div id="app">
        <vote-page v-if="isVoting" />
        <assignment-page v-else-if="isAssigned" />
        <waiting-page v-else-if="isWaiting" />
        <login-page v-else-if="isLoggingIn" />
    </div>
</template>

<script>
import LoginPage from './components/LoginPage.vue';
import WaitingPage from './components/WaitingPage/index.vue';
import AssignmentPage from './components/AssignmentPage.vue';
import VotePage from './components/VotePage.vue';

import { mapGetters } from 'vuex';

export default {
    components: {
        LoginPage,
        WaitingPage,
        AssignmentPage,
        VotePage
    },

    computed: {
        ...mapGetters({
            self: 'self',
            assignment: 'assignment',
            isVoting: 'isVoting',
        }),

        isWaiting() {
            return this.self != null && this.assignment == null;
        },

        isLoggingIn() {
            return this.self == null;
        },

        isAssigned() {
            return this.assignment != null;
        },
    }
};
</script>

<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
}

body {
    margin: 0;
    background-color: #b9a992;
}
</style>

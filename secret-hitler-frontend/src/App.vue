<template>
    <div id="app">
        <span class="raw">{{ localPlayer && localPlayer.name }}</span>

        <div class="results" v-if="result">
            <result-view :result="result"/>
        </div>

        <div class="page-container" v-else-if="page">
            <component :is="`${page}-view`"/>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import * as socket from '@/socket';

import LobbyView from '@/components/lobby-view';
import NominatingView from '@/components/nominating-view';
import LegislatingView from '@/components/legistlating-view';
import VotingView from '@/components/voting-view';
import LoginView from '@/components/login-view';
import ExecutiveActionView from '@/components/executive_action-view';
import CompleteView from '@/components/complete-view';

import ResultView from '@/components/result-view';

export default {
    name: 'SecretHitler',

    components: {
        LobbyView,
        NominatingView,
        LegislatingView,
        VotingView,
        LoginView,
        ResultView,
        ExecutiveActionView,
        CompleteView,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            results: 'results',
            localPlayer: 'localPlayer',
        }),

        raw() {
            return JSON.stringify(this.game, null, 4);
        },

        page() {
            if (!this.game)
                return 'login';

            if (this.game.state == 'EXECUTIVE_ACTION')
                return 'executive-action';

            return this.game.state.toLowerCase();
        },

        isStarted() {
            return this.game != null && this.game.state != 'LOBBY';
        },

        result() {
            return this.results[0];
        },
    },

    watch: {
        isStarted() {
            try {
                localStorage.setItem('secret-hitler/player-id', this.localPlayer.id);
            } catch (e) { }
        }
    },

    created() {
        let id;
        try {
            id = localStorage.getItem('secret-hitler/player-id') || '';
            id = parseInt(id);
            if (isNaN(id)) return;
        } catch (e) {
            return
        }

        socket.rejoin(id);
    },
};
</script>

<style>
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    background-color: red;
}

.results {
    flex: 1;
    overflow: hidden;
    background-color: #b9a992;
}

.page-container {
    flex: 1;
    overflow: hidden;
    background-color: #b9a992;
}

.raw {
    white-space: pre;
    font-family: monospace;
}

body {
    margin: 0;
    background-color: #b9a992;
}
</style>

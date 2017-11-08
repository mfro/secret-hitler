<template>
    <result-view :result="result" v-if="result"/>

    <component :is="`${page}-view`" v-else-if="page"/>

    <span class="raw" v-else>{{ game }}</span>
</template>

<script>
import { mapGetters } from 'vuex';

import LobbyView from '@/components/lobby-view';
import NominatingView from '@/components/nominating-view';
import LegislatingView from '@/components/legistlating-view';
import VotingView from '@/components/voting-view';
import LoginView from '@/components/login-view';
import ExecutiveActionView from '@/components/executive_action-view';
import CompletedView from '@/components/completed-view';

import ResultView from '@/components/result-view';

export default {
    components: {
        LobbyView,
        NominatingView,
        LegislatingView,
        VotingView,
        LoginView,
        ExecutiveActionView,
        CompletedView,
        ResultView,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            results: 'results',
            isWatching: 'isWatching',
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

        result() {
            return this.results[0];
        },
    }
};
</script>

<style module lang="less">
@import "~style";

</style>

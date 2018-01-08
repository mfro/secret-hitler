<template>
    <login-view v-if="!game"/>

    <dead-view v-else-if="isDead"/>

    <result-view :result="result" v-else-if="result"/>

    <component :is="page" v-else-if="page"/>

    <span class="raw" v-else>{{ game }}</span>
</template>

<script>
import { mapGetters } from 'vuex';

import LoginView from './login-page';
import DeadView from './dead-player';
import ResultView from './result-alert';

const regex = /([\w-]+)\/index.vue$/;
const context = require.context('@player/ui/game-states', true, /([\w-]+)\/index.vue$/);
const gameStates = {};

for (let key of context.keys()) {
    let match = regex.exec(key);
    let name = match[1].toLowerCase();
    let options = context(key);

    gameStates[`game-${name}-state`] = options;
}

export default {
    components: {
        DeadView,
        LoginView,
        ResultView,

        ...gameStates,
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
            return `game-${this.game.state.toLowerCase()}-state`;
        },

        isDead() {
            return this.game.state != 'COMPLETED' && this.localPlayer.isAlive === false;
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

<template>
    <uikit:simple-page>
        <span slot="header">Game lobby</span>
        
        <div class="contents">
            <player :id="localPlayer.id" />

            <player v-for="player in others" :key="player.id" :id="player.id" />
        </div>

        <div slot="footer" class="controls">
            <uikit:button @click="cancel()">Cancel</uikit:button>

            <uikit:button v-if="localPlayer.isReady" @click="ready(false)">Not ready</uikit:button>
            <uikit:button v-else @click="ready(true)">Ready</uikit:button>
        </div>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import Player from './player';

export default {
    name: 'LobbyView',

    components: {
        Player,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            localPlayer: 'localPlayer',
        }),

        others() {
            return this.game.players.filter(p => p != this.localPlayer);
        }
    },

    methods: {
        ready(isReady) {
            this.$send('SET_READY', { isReady });
        }
    }
};
</script>

<style scoped lang="less">
@import "~style";

.controls {
    display: flex;
    justify-content: center;

    > button {
        margin: 0 0.5em;
    }
}
</style>
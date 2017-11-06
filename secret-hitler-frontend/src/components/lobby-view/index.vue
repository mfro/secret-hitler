<template>
    <uikit:simple-page>
        <span slot="header">Game lobby: {{ game.name }}</span>
        
        <v-layout wrap align-start align-content-start>
            <v-layout v-for="player in players" :key="player.id"
                align-center px-3 py-2
                class="player">
                <v-icon medium class="icon green--text" v-if="player.isReady">check</v-icon>
                <v-icon medium class="icon red--text" v-else>clear</v-icon>

                <span class="player-name ml-3">{{ player.name }}</span>
            </v-layout>
        </v-layout>

        <div slot="footer" class="controls">
            <v-btn @click="cancel()">Cancel</v-btn>

            <v-btn v-if="localPlayer.isReady" @click="ready(false)">Not ready</v-btn>
            <v-btn v-else @click="ready(true)">Ready</v-btn>
        </div>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'LobbyView',

    computed: {
        ...mapGetters({
            game: 'game',
            allPlayers: 'allPlayers',
            localPlayer: 'localPlayer',
        }),

        players() {
            return [this.localPlayer, ...this.others];
        },

        others() {
            return this.allPlayers.filter(p => p != this.localPlayer);
        },
    },

    methods: {
        ready(isReady) {
            this.$send('SET_READY', { isReady });
        },

        cancel() {
            this.$store.commit('RESET');
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.player {
    flex-basis: 51%;
    
    .icon {
        transition: none;
        font-weight: bold;
    }
}

.controls {
    display: flex;
    justify-content: center;

    > button {
        margin: 0 0.5em;
    }
}
</style>
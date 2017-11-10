<template>
    <uikit:simple-page>
        <span slot="header">Game lobby: {{ game.name }}</span>
        
        <player-list>
            <template slot="icon" slot-scope="{ player }">
                <v-icon medium class="green--text" v-if="player.isReady">check</v-icon>
                <v-icon medium v-else>hourglass_empty</v-icon>
            </template>
        </player-list>

        <v-layout class="box-container">
            <v-flex class="box"/>
        </v-layout>

        <v-layout slot="footer" align-center justify-center>
            <v-btn @click="cancel()">Cancel</v-btn>

            <v-btn v-if="localPlayer.isReady" @click="ready(false)">Not ready</v-btn>
            <v-btn v-else @click="ready(true)">Ready</v-btn>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import * as socket from '@/socket';

import PlayerList from '@/ui/player-list';

export default {
    name: 'LobbyView',

    components: {
        PlayerList,
    },

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
            socket.reset();
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.box-container {
    flex: 0 0 40vh;
}

.box {
    margin: @spacer;
    background-size: contain;
    background-image: url('../../assets/misc/box.svg');
    background-position: center;
}
</style>

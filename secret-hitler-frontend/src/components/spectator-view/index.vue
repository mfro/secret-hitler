<template>
    <v-app>
        <v-layout>
            <v-layout class="log-container">
                <log-view/>
            </v-layout>

            <v-layout column v-if="isStarted">
                <v-spacer/>

                <v-layout class="container">
                    <gameboard type="LIBERAL"/>
                </v-layout>

                <v-spacer/>

                <v-layout class="container">
                    <gameboard type="FASCIST"/>
                </v-layout>

                <v-spacer/>

                <v-layout class="container">
                    <player-display/>
                </v-layout>
            </v-layout>

            <v-layout v-else>
                <player-list large>
                    <template slot="icon" slot-scope="{ player }">
                        <v-icon medium class="green--text" v-if="player.isReady">check</v-icon>
                        <v-icon medium class="red--text" v-else>clear</v-icon>
                    </template>
                </player-list>
            </v-layout>
        </v-layout>
    </v-app>
</template>

<script>
import { mapGetters } from 'vuex';

import LogView from '@/router/routes/LogView';

import PlayerList from '@/ui/player-list';
import PolicyCard from '@/ui/policy-card';

import Gameboard from './gameboard';
import PlayerDisplay from './player-display';

export default {
    components: {
        PolicyCard,
        LogView,
        PlayerList,
        Gameboard,
        PlayerDisplay,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            results: 'results',
            isWatching: 'isWatching',
            localPlayer: 'localPlayer',
        }),

        isStarted() {
            return this.game != null && this.game.state != 'LOBBY';
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.log-container {
    flex: 0 0 400px;
    background: white;
    overflow: auto;
    box-shadow: 0 0 20px -1px black;

    height: 100vh;
    z-index: 1;
}

.container {
    flex: 0 0 auto;
}

</style>
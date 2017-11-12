<template>
    <v-layout class="root">
        <v-layout column fill-height class="player-list">
            <player v-for="player in leftHalf" :key="player.id" :player="player"/>
        </v-layout>

        <v-layout column justify-center v-if="isStarted">
            <v-spacer/>

            <div>
                <gameboard type="LIBERAL"/>
            </div>

            <v-spacer/>

            <v-layout fill-height class="stack-container">
                <policy-stack class="stack" :count="game.boardState.drawSize"/>
                <policy-stack class="stack" :count="game.boardState.discardSize"/>
            </v-layout>

            <v-spacer/>

            <div>
                <gameboard type="FASCIST"/>
            </div>

            <v-spacer/>
        </v-layout>

        <v-layout column v-else>
            <div>
                <v-layout mt-5 justify-center>
                    <span class="display-4">Game Code: {{ game.name}}</span>
                </v-layout>
            </div>

            <v-flex class="box"/>
        </v-layout>

        <v-layout column fill-height class="player-list">
            <player v-for="player in rightHalf" :key="player.id" :player="player" right/>
        </v-layout>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import Player from './player-sides';
import Gameboard from '../gameboard';

import PolicyStack from './policy-stack';

export default {
    components: {
        Player,
        Gameboard,
        PolicyStack,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            allPlayers: 'allPlayers',
        }),

        isStarted() {
            return this.game.state != 'LOBBY';
        },

        rightHalf() {
            // return this.allPlayers;

            let count = Math.floor(this.allPlayers.length / 2);
            return this.allPlayers.slice(0, count);
        },

        leftHalf() {
            // return this.allPlayers;

            let count = Math.floor(this.allPlayers.length / 2);
            return this.allPlayers.slice(count).reverse();
        }
    },
};
</script>

<style module lang="less">
@import "~style";

.root {
    height: 100vh;
    overflow: hidden;
}

.stack-container {
    height: 15vh;
    justify-content: space-around;
    justify-content: space-evenly;
}

.player-list {
    flex: 0 0 auto;

    padding: (@spacer * 0.5) 0;
    justify-content: space-around;
    justify-content: space-evenly;
}

.box {
    margin: 6%;
    background-size: contain;
    background-image: url('@/assets/misc/box.svg');
    background-position: center;
}
</style>

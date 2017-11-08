<template>
    <v-layout class="gameboard" fill-height justify-center>
        <v-layout class="stack-container" v-if="type == 'LIBERAL'">
            <policy-stack class="stack" :count="game.boardState.drawSize"/>
        </v-layout>

        <div class="board">
            <div class="image" :style="imageStyle"/>

            <div class="cards">
                <policy-card class="card" :policy="type" v-for="i in score" :key="i" :style="style(i - 1)"/>
            </div>

            <div class="tracker" :style="trackerStyle" v-if="type == 'LIBERAL'"><div/></div>
        </div>

        <v-layout class="stack-container" v-if="type == 'LIBERAL'">
            <policy-stack class="stack" :count="game.boardState.discardSize"/>
        </v-layout>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicyCard from '@/ui/policy-card';
import PolicyStack from './policy-stack';

import * as liberalBoard from '@/assets/board/liberal.png';
import * as fascistLBoard from '@/assets/board/fascist_l.png';
import * as fascistMBoard from '@/assets/board/fascist_m.png';
import * as fascistSBoard from '@/assets/board/fascist_s.png';

export default {
    components: {
        PolicyCard,
        PolicyStack,
    },

    props: {
        type: String,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            allPlayers: 'allPlayers',
        }),

        score() {
            if (this.type == 'LIBERAL')
                return this.game.boardState.liberals;

            if (this.type == 'FASCIST')
                return this.game.boardState.fascists;
        },

        imageStyle() {
            let image;
            if (this.type == 'LIBERAL')
                image = liberalBoard;

            if (this.type == 'FASCIST') {
                if (this.allPlayers.length >= 9)
                    image = fascistLBoard;

                if (this.allPlayers.length >= 7)
                    image = fascistMBoard;

                if (this.allPlayers.length >= 5)
                    image = fascistSBoard;
            }

            return {
                backgroundImage: `url(${image})`
            };
        },

        trackerStyle() {
            return {
                left: 32.94 + (this.game.boardState.voteFailures * 9.55) + '%',
            };
        }
    },

    methods: {
        style(index) {
            if (this.type == 'LIBERAL') {
                return {
                    left: (15.7 + index * 14.12) + '%',
                };
            }

            if (this.type == 'FASCIST') {
                return {
                    left: (9.1 + index * 13.95) + '%',
                };
            }
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.stack-container {
    padding: 0 @spacer;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
}

.stack {
    width: 120px;
}

.board {
    flex: 0 1 1200px;
    background-color: #434343;
    padding: 1%;
    box-sizing: border-box;
    border: 2px solid lightgray;
    align-self: center;
    position: relative;
}

.image {
    width: 100%;
    height: 100%;
    padding-top: (80000% / 2407);
    background-size: contain;
    background-position: center;
}

.card {
    height: 48%;
    top: 26.2%;
    position: absolute !important;
    box-shadow: 0 0 10px gray;
}

.tracker {
    position: absolute;
    bottom: 8.9%;
    width: 4%;
    border-radius: 50%;
    background: #7B1FA2;
    box-shadow: 0 0 10px gray;
    border: 1px solid gray;

    >div {
        padding-top: 100%;
    }
}
</style>

<template>
    <v-layout class="gameboard" mx-3 justify-center>
        <div class="board">
            <div class="image" :class="image"/>

            <div class="cards">
                <policy-card basis="long" class="card" :policy="type" v-for="i in score" :key="i" :style="style(i - 1)"/>
            </div>

            <div class="tracker" :style="trackerStyle" v-if="type == 'LIBERAL'"><div/></div>
        </div>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicyCard from '@/ui/cards/policy';
import PolicyStack from './policy-stack';

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

        image() {
            if (this.type == 'LIBERAL')
                return 'liberal';

            if (this.type == 'FASCIST') {
                if (this.allPlayers.length >= 9)
                    return 'fascist_l';

                if (this.allPlayers.length >= 7)
                    return 'fascist_m';

                if (this.allPlayers.length >= 5)
                    return 'fascist_s';
            }
        },

        trackerStyle() {
            return {
                left: 32.9 + (this.game.boardState.voteFailures * 9.55) + '%',
            };
        }
    },

    methods: {
        style(index) {
            if (this.type == 'LIBERAL') {
                let left;

                if (index > 4)
                    left = -1000;
                else if (index == 4)
                    left = 72.3
                else
                    left = 15.9 + (index * 14.05);

                return {
                    left: left + '%',
                };
            }

            if (this.type == 'FASCIST') {
                return {
                    left: 9.0 + (index * 14) + '%',
                };
            }
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.stack-container {
    padding: 0 (@spacer * 4);
    flex: 1 0 auto;
    align-items: center;
    // justify-content: center;
}

.stack {
    width: 120px;
}

.board {
    flex: 0 1 100vh;
    background-color: #434343;
    padding: 1vh;
    box-sizing: border-box;
    border: 2px solid lightgray;
    align-self: center;
    position: relative;
    
    @media screen and ( max-height: 800px ) {
        flex: 0 1 80vh;
        padding: .8vh;
    }
}

.image {
    width: 100%;
    height: 100%;
    padding-top: (80000% / 2407);
    background-size: contain;
    background-position: center;

    &.liberal {
        background-image: url('@/assets/board/liberal.png')
    }

    &.fascist_l {
        background-image: url('@/assets/board/fascist_l.png')
    }

    &.fascist_m {
        background-image: url('@/assets/board/fascist_m.png')
    }

    &.fascist_s {
        background-image: url('@/assets/board/fascist_s.png')
    }
}

.card {
    height: (98% * 0.49);
    top: 26.2%;
    position: absolute !important;
    box-shadow: 0 0 10px gray;
}

.tracker {
    position: absolute;
    bottom: (98% * 0.084);
    width: (98% * 0.04);
    border-radius: 50%;
    background: #7B1FA2;
    box-shadow: 0 0 10px gray;
    border: 1px solid gray;

    >div {
        padding-top: 100%;
    }
}
</style>

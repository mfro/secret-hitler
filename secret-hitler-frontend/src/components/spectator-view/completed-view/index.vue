<template>
    <v-layout class="background" :class="team" column align-center>
        <div class="image" :class="team"/>

        <v-flex class="info" :class="team">
            <span v-if="game.victory == 'FASCIST_HITLER'">
                Hitler was elected chancellor
            </span>
            
            <span v-else-if="game.victory == 'LIBERAL_HITLER'">
                Hitler was assassinated
            </span>
            
            <span v-else-if="game.victory == 'FASCIST_POLICY'">
                6 fascist policies were enacted
            </span>
            
            <span v-else-if="game.victory == 'LIBERAL_POLICY'">
                5 liberal policies were enacted
            </span>
        </v-flex>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            game: 'game',
            results: 'results',
            isWatching: 'isWatching',
            localPlayer: 'localPlayer',
        }),

        key() {
            return this.game.victory.toLowerCase();
        },

        team() {
            switch (this.game.victory) {
                case 'FASCIST_HITLER':
                case 'FASCIST_POLICY':
                    return 'fascist';
                case 'LIBERAL_HITLER':
                case 'LIBERAL_POLICY':
                    return 'liberal';
            }
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.background {
    padding: 7% 0;

    &.liberal {
        background: rgb(0, 79, 110);
    }

    &.fascist {
        background: rgb(153, 2, 0);
    }
}

.image {
    width: 512px;
    height: 512px;
    background-size: contain;
    background-position: center;

    &.liberal {
        background-image: url(../../../assets/misc/liberal-victory.png);
    }

    &.fascist {
        background-image: url(../../../assets/misc/fascist-victory.png);
    }
}

.info {
    .text();
    font-size: 5rem;

    &.liberal {
        color: white;
        text-shadow: 0 0 20px fade(white, 50%);
    }

    &.fascist {
        text-shadow: 0 0 20px fade(black, 50%);
    }
}
</style>

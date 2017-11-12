<template>
    <v-layout wrap align-start align-content-start px-2>
        <v-layout v-for="player in options" :key="player.id"
            align-center px-3 py-1
            class="player-v2" :class="{ active: player == value }"
            v-touch-class
            @click="$emit('input', player)">
            <span class="player-name">{{ player.name }}</span>
        </v-layout>

        <!-- <v-layout v-for="player in options" :key="player.id"
            align-center px-3 py-2
            class="player"
            v-touch-class
            @click="$emit('input', player)">
            <v-icon medium v-if="player == value">radio_button_checked</v-icon>
            <v-icon medium v-else>radio_button_unchecked</v-icon>

            <span class="player-name ml-3">{{ player.name }}</span>
        </v-layout> -->
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: {
        value: Object,
        filter: { type: Function, required: false },
    },

    computed: {
        ...mapGetters({
            game: 'game',
            allPlayers: 'allPlayers',
            localPlayer: 'localPlayer',
        }),

        options() {
            let list = this.allPlayers.filter(p => {
                if (p.isAlive === false)
                    return false;
                
                return !this.filter || this.filter(p)
            });

            return [...list, ...list, ...list.slice(0, 2)];
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.player-v2 {
    flex-basis: 34%;

    box-shadow: 0 0 10px gray;

    border-radius: 3px;
    margin: @spacer (@spacer * 0.5) 0;

    &.active {
        box-shadow: 0 0 10px gray,
                    0 0 0px 4px #4CAF50;
    }
}

.player {
    flex-basis: 51%;

    .icon {
        font-weight: bold;
    }

    &.touch-active {
        background-color: rgba(0, 0, 0, .1);
    }
}
</style>

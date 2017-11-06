<template>
    <v-layout wrap align-start align-content-start>
        <v-layout v-for="player in options" :key="player.id"
            align-center px-3 py-2
            class="player"
            v-touch-class
            @click="$emit('input', player)">
            <v-icon medium v-if="player == value">radio_button_checked</v-icon>
            <v-icon medium v-else>radio_button_unchecked</v-icon>

            <span class="player-name ml-3">{{ player.name }}</span>
        </v-layout>
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
            return this.allPlayers.filter(p => !this.filter || this.filter(p));
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.preview-deck {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
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

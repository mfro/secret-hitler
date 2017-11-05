<template>
    <div class="player-selector">
        <player v-for="player in options" :key="player.id" :id="player.id" :active="player == value" @input="$emit('input', $event)"/>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Player from './player';

export default {
    components: {
        Player,
    },

    props: {
        value: Object,
        filter: { type: Function, required: false },
    },

    computed: {
        ...mapGetters({
            game: 'game',
            localPlayer: 'localPlayer',
        }),

        options() {
            return this.game.players.filter(p => !this.filter || this.filter(p));
        },
    },
};
</script>

<style scoped lang="less">
@import "~style";

.preview-deck {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
}

.card {
    height: 16em;
}
</style>

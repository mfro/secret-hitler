<template>
    <div class="player-list">
        <player v-for="player in players" :key="player.id" :player="player" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import player from './player.vue';

export default {
    components: {
        player,
    },

    computed: {
        ...mapGetters({
            self: 'self',
            allPlayers: 'allPlayers',
        }),

        players() {
            return this.allPlayers.filter(p => p.id != this.self.id);
        }
    }
};
</script>

<style lang="less" scoped>
.player-list {
    display: flex;
    flex-wrap: wrap;
}
</style>

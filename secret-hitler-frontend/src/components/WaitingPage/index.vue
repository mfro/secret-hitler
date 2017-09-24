<template>
    <div class="loading" v-if="!allPlayers">
        Loading...
    </div>
    <div class="lobby" v-else>
        <player :player="self" />

        <player v-for="player in players" :key="player.id" :player="player" />

        <div class="ready-container">
            <uikit-button @click="cancel()">Cancel</uikit-button>

            <uikit-button v-if="self.isReady" @click="ready(false)">Not ready</uikit-button>
            <uikit-button v-else @click="ready(true)">Ready</uikit-button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Player from './player.vue';

export default {
    components: {
        Player,
    },

    computed: {
        ...mapGetters({
            self: 'self',
            allPlayers: 'allPlayers',
        }),

        players() {
            return this.allPlayers.filter(p => p.id != this.self.id);
        }
    },

    methods: {
        cancel() {
            this.$store.dispatch('reset');
        },

        ready(isReady) {
            this.$store.dispatch('setReady', isReady);
        }
    }
};
</script>

<style lang="less" scoped>
.loading {
    display: flex;
    justify-content: center;

    padding: 5em;
}

.ready-container {
    display: flex;
    justify-content: center;

    >button {
        margin: 0 0.5em;
    }
}
</style>

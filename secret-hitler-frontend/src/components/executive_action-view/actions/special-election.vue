<template>
    <uikit:simple-page>
        <span slot="header">Choose the next president</span>

        <player-selector v-model="target" :filter="filter"/>
        
        <v-layout slot="footer" align-center justify-center>
            <v-btn :disabled="!target" @click="submit()">Nominate</v-btn>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import PlayerSelector from '@/ui/player-selector';

export default {
    components: {
        PlayerSelector,
    },

    data() {
        return {
            target: null,
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            localPlayer: 'localPlayer',
        }),

        action() {
            return this.game.executiveAction;
        },
    },

    methods: {
        filter(p) {
            return p != this.localPlayer && p.isAlive;
        },

        submit() {
            this.$send('SET_ACTION_TARGET', { target: this.target.id });
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

.card {
    height: 16em;
}

.bottom {
    flex: 0 0 auto;
    margin: 1em;
    display: flex;
    justify-content: center;
}
</style>

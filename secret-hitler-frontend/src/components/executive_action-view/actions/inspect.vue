<template>
    <uikit:simple-page v-if="!action.target">
        <span slot="header">Choose a player to inspect</span>

        <player-selector v-model="target" :filter="filter"/>
        
        <v-layout slot="footer" align-center justify-center>
            <v-btn :disabled="!target" @click="submit()">Inspect</v-btn>
        </v-layout>
    </uikit:simple-page>

    <uikit:simple-page v-else>
        <span slot="header">{{ learned_player.name }} is {{ learned_result }}</span>

        <v-layout slot="footer" align-center justify-center>
            <v-btn @click="finish()">Ok</v-btn>
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
            getPlayer: 'getPlayer',
            localPlayer: 'localPlayer',
        }),

        action() {
            return this.game.executiveAction;
        },

        learned_player() {
            return this.getPlayer(this.action.target);
        },

        learned_result() {
            if (this.action.learned == null)
                return null;

            if (this.action.learned.membership == 'LIBERAL')
                return 'liberal';

            return 'fascist';
        }
    },

    methods: {
        filter(p) {
            return p != this.localPlayer;
        },

        submit() {
            this.$send('SET_ACTION_TARGET', { target: this.target.id });
        },

        finish() {
            this.$send('COMPLETE_ACTION');
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

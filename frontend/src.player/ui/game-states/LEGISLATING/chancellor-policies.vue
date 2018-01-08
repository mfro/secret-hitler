<template>
    <uikit:simple-page>
        <span slot="header">Select a policy to enact</span>

        <policy-selector :cards="session.chancellorCards" v-model="discarding"/>

        <v-layout slot="footer" align-center justify-center>
            <v-btn v-if="showVeto" :disabled="!canVeto" @click="veto()">Request veto</v-btn>

            <v-btn :disabled="!isReady" @click="submit()">Enact</v-btn>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicySelector from './policy-selector';

export default {
    components: {
        PolicySelector,
    },

    data() {
        return {
            discarding: null,
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            localPlayer: 'localPlayer',
        }),

        session() {
            return this.game.legislature;
        },

        isReady() {
            return this.discarding != null;
        },

        showVeto() {
            return this.game.boardState.fascists == 5;
        },

        canVeto() {
            return this.showVeto && !this.session.vetoRequested;
        }
    },

    methods: {
        veto() {
            this.$send('LEGISLATURE_VETO');
        },
        
        submit() {
            if (this.session.chancellor == this.localPlayer.id) {
                this.$send('LEGISLATURE_DISCARD', { card: this.discarding });
            }
        }
    }
}
</script>

<style module lang="less">
@import "~style";

.card-box {
    flex-basis: 0;

    .active {
        box-shadow: 0 0 0 4px #4CAF50;
    }
}
</style>

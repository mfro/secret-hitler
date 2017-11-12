<template>
    <uikit:simple-page>
        <span slot="header">Select a policy to enact</span>

        <v-layout align-center py-3 pl-3>
            <v-flex v-for="(card, i) in session.chancellorCards" :key="i" class="card-box mr-3">
                <policy-card :policy="card" @input="selected = i" :class="{ active: selected == i}"/>
            </v-flex>
        </v-layout>

        <v-layout slot="footer" align-center justify-center>
            <v-btn v-if="showVeto" :disabled="!canVeto" @click="veto()">Request veto</v-btn>

            <v-btn :disabled="!isReady" @click="submit()">Enact</v-btn>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicyCard from '@/ui/cards/policy';

export default {
    components: {
        PolicyCard,
    },

    data() {
        return {
            selected: -1,
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
            return this.selected != -1;
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
            let is = [0, 1];
            is.splice(is.indexOf(this.selected), 1);

            let discard = this.session.chancellorCards[is[0]];

            this.$send('LEGISLATURE_DISCARD', { card: discard });
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

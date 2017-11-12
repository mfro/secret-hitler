<template>
    <uikit:simple-page>
        <span slot="header">These are the top three cards in the deck</span>

        <v-layout align-center pl-3>
            <policy-card class="card" :policy="card" v-for="(card, i) of action.learned" :key="i"/>
        </v-layout>
        
        <v-layout slot="footer" align-center justify-center>
            <v-btn @click="complete()">Ok</v-btn>
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
        complete() {
            this.$send('COMPLETE_ACTION');
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.preview-deck {
    display: flex;
    justify-content: center;

    padding: 1em 0 1em 1em;
}

.card {
    flex: 1 1;
    margin-right: @spacer;
}
</style>

<template>
    <uikit:simple-page no-footer>
        <span slot="header">A {{ policy }} policy was enacted
            <template v-if="!args.government">by anarchy</template>
        </span>

        <government v-if="args.government" :government="args.government"/>

        <v-layout column align-center justify-center>
            <policy-card basis="long" class="card" :policy="args.policy"/>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import Government from '@/ui/government';
import PolicyCard from '@/ui/cards/policy';

export default {
    components: {
        Government,
        PolicyCard,
    },

    props: {
        args: Object,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            localPlayer: 'localPlayer',
        }),

        policy() {
            return this.args.policy.toLowerCase();
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.info {
    .text();
}

.card {
    flex: 1 1;
    min-height: 8em;
    max-height: 16em;
}
</style>

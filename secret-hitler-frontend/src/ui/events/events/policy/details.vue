<template>
    <uikit:simple-page no-footer>
        <span slot="header">A {{ policy }} policy was enacted
            <template v-if="!args.government">by anarchy</template>
        </span>

        <government v-if="args.government" :government="args.government"/>

        <v-layout align-center justify-center>
            <policy-card class="card" :policy="args.policy"/>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import Government from '@/ui/government';
import PolicyCard from '@/ui/policy-card';

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
    height: 16em;
}
</style>

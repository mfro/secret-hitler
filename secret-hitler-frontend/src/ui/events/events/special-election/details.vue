<template>
    <uikit:simple-page no-footer>
        <span slot="header">{{target.name }} was nominated as president by {{ president.name }}</span>

        <v-layout column justify-center>
            <government :president="president"/>

            <v-icon class="arrow">arrow_downward</v-icon>

            <government :president="target"/>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicyCard from '@/ui/policy-card';
import Government from '@/ui/government';

export default {
    components: {
        PolicyCard,
        Government,
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

        president() {
            return this.getPlayer(this.args.president);
        },

        target() {
            return this.getPlayer(this.args.target);
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.arrow {
    font-size: 4em;
    margin: @spacer 0;
}
</style>

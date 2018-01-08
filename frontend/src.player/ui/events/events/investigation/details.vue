<template>
    <uikit:simple-page no-footer>
        <span slot="header">{{ target.name }} was investigated</span>

        <government :president="president"/>

        <v-layout align-center justify-center>
            <v-icon class="icon">mdi-magnify</v-icon>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import Government from '@/ui/government';

export default {
    components: {
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

.icon {
    font-size: 18em;
}
</style>

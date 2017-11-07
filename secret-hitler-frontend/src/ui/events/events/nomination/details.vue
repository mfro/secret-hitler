<template>
    <uikit:simple-page no-footer>
        <span slot="header">A government was proposed</span>

        <government :president="president" :chancellor="chancellor"/>
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

        chancellor() {
            return this.getPlayer(this.args.chancellor);
        },
    },
};
</script>

<style module lang="less">
@import "~style";
</style>

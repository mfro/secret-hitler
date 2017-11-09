<template>
    <uikit:simple-page no-footer>
        <span slot="header" v-if="args.agree">The legislature agreed to a veto</span>
        <span slot="header" v-else>The president denied a veto</span>

        <government :government="args"/>
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
    },
};
</script>

<style module lang="less">
@import "~style";
</style>

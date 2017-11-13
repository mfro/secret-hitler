<template>
    <base-event>
        <v-icon slot="icon" v-if="args.agree">mdi-shield</v-icon>
        <v-icon slot="icon" v-else>mdi-shield-outline</v-icon>

        <div class="subtitle">
            <span v-if="args.agree">Veto</span>
            <span v-else>Veto denied</span>
        </div>
    </base-event>
</template>

<script>
import { mapGetters } from 'vuex';

import BaseEvent from '../base';

export default {
    components: {
        BaseEvent,
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
@import "../style";
</style>

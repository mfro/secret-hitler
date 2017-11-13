<template>
    <base-event>
        <v-icon slot="icon">mdi-magnify</v-icon>

        <div class="subtitle">
            <span>{{ target.name }}</span>
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
@import "../style";
</style>

<template>
    <base-event>
        <v-icon slot="icon">supervisor_account</v-icon>

        <div class="subtitle">
            <span>{{ president.name }}</span>
        </div>

        <div class="subtitle">
            <span>{{ chancellor.name }}</span>
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

        chancellor() {
            return this.getPlayer(this.args.chancellor);
        },
    },
};
</script>

<style module lang="less">
@import "../style";
</style>

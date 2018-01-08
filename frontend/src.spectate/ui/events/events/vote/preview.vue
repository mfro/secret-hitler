<template>
    <base-event>
        <v-icon slot="icon" class="green--text" v-if="args.pass">check</v-icon>
        <v-icon slot="icon" class="red--text" v-else>clear</v-icon>

        <div class="subtitle">
            <span v-if="args.pass">The vote passed</span>
            <span v-else>The vote failed</span>
        </div>

        <div class="subtitle">
            <span>{{ args.votes.ja.length }} to {{ args.votes.nein.length }}</span>
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

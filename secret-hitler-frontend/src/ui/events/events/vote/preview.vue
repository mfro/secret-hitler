<template>
    <v-list-tile @click="$emit('details')">
        <v-list-tile-action>
            <v-icon medium class="icon green--text" v-if="args.pass">check</v-icon>
            <v-icon medium class="icon red--text" v-else>clear</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title v-if="args.pass">The vote passed</v-list-tile-title>
            <v-list-tile-title v-else>The vote failed</v-list-tile-title>
            <v-list-tile-sub-title>{{ president.name }} and {{ chancellor.name }}</v-list-tile-sub-title>
        </v-list-tile-content>
    </v-list-tile>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
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

.icon {
    font-weight: bold;
}
</style>

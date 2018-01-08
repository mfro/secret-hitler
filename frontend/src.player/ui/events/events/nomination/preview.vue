<template>
    <v-list-tile>
        <v-list-tile-action>
            <v-icon medium>supervisor_account</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title>A government was proposed</v-list-tile-title>
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
</style>

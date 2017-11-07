<template>
    <v-list-tile>
        <v-list-tile-action>
            <v-icon medium>mdi-emoticon-dead</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title>An assassination</v-list-tile-title>
            <v-list-tile-sub-title>{{ president.name }} assassinated {{ target.name }}</v-list-tile-sub-title>
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

        target() {
            return this.getPlayer(this.args.target);
        },
    },
};
</script>

<style module lang="less">
@import "~style";
</style>

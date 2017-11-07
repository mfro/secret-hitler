<template>
    <v-list-tile>
        <v-list-tile-action>
            <v-icon medium>visibility</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title>The deck was inspected</v-list-tile-title>
            <v-list-tile-sub-title>{{ president.name }} saw the top 3 cards</v-list-tile-sub-title>
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
    },
};
</script>

<style module lang="less">
@import "~style";
</style>

<template>
    <v-list-tile>
        <v-list-tile-action>
            <v-icon medium v-if="args.agree">mdi-shield</v-icon>
            <v-icon medium v-else>mdi-shield-outline</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title v-if="args.agree">The legislature agreed to a veto</v-list-tile-title>
            <v-list-tile-title v-else>The president denied a veto</v-list-tile-title>
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
    },
};
</script>

<style module lang="less">
@import "~style";
</style>

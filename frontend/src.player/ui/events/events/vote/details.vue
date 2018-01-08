<template>
    <uikit:simple-page :no-header="args.pass">
        <span slot="header" v-if="!args.pass">The vote failed</span>
        
        <government :government="args"/>

        <player-list>
            <template slot="icon" slot-scope="{ player }">
                <v-icon medium class="icon green--text" v-if="getVote(player)">thumb_up</v-icon>
                <v-icon medium class="icon red--text" v-else>thumb_down</v-icon>
            </template>
        </player-list>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import PlayerList from '@/ui/players/list';
import Government from '@/ui/government';

export default {
    components: {
        PlayerList,
        Government,
    },

    props: {
        args: Object,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            allPlayers: 'allPlayers',
            localPlayer: 'localPlayer',
        }),

        president() {
            return this.getPlayer(this.args.president);
        },

        chancellor() {
            return this.getPlayer(this.args.chancellor);
        },
    },

    methods: {
        getVote(player) {
            return this.args.votes.ja.includes(player.id);
        }
    }
};
</script>

<style module lang="less">
@import "~style";
</style>

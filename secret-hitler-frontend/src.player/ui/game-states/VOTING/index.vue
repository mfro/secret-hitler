<template>
    <uikit:simple-page no-footer no-header>
        <government :president="president" :chancellor="chancellor"/>
        
        <player-list large v-if="localPlayer.hasVoted" :filter="filter">
            <v-list-tile slot="prefix">
                <v-list-tile-action>
                    <v-icon medium class="icon">hourglass_empty</v-icon>
                </v-list-tile-action>
                <v-list-tile-title>
                    <span class="header">Waiting for votes...</span>
                </v-list-tile-title>
            </v-list-tile>
        </player-list>
            
        <v-layout align-center justify-center v-else class="pl-3">
            <voting-card class="card mr-3" @input="vote" :vote="true"/>
            <voting-card class="card mr-3" @input="vote" :vote="false"/>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import VotingCard from '@/ui/cards/voting';
import PlayerList from '@/ui/players/list';
import Government from '@/ui/government';

export default {
    components: {
        VotingCard,
        PlayerList,
        Government,
    },

    data() {
        return {
            selected: null,
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            allPlayers: 'allPlayers',
            localPlayer: 'localPlayer',
        }),

        president() {
            return this.getPlayer(this.game.nomination.president);
        },

        chancellor() {
            return this.getPlayer(this.game.nomination.chancellor);
        },
    },

    methods: {
        filter(player) {
            return !player.hasVoted;
        },

        vote(vote) {
            this.$send('SUBMIT_VOTE', { vote: vote });
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.card {
    flex: 1 1;
}

.header {
    .text();
}
</style>

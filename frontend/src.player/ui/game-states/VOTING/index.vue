<template>
    <uikit:simple-page no-header>
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
            <v-flex class="card-box" v-for="val in [true, false]" :key="val">
                <voting-card class="mr-3" :class="{ active: vote === val }" @input="vote = val" :vote="val"/>
            </v-flex>
        </v-layout>

        <v-layout slot="footer" align-center justify-center>
            <v-btn v-if="!localPlayer.hasVoted" :disabled="typeof vote != 'boolean'" @click="submit()">Vote</v-btn>
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
            vote: null,
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

        submit() {
            this.$send('SUBMIT_VOTE', { vote: this.vote });
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.header {
    .text();
}

.card-box {
    flex-basis: 0;

    .active {
        box-shadow: 0 0 0 4px #4CAF50;
    }
}
</style>

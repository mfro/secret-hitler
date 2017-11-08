<template>
    <uikit:simple-page no-footer no-header>
        <government :president="president" :chancellor="chancellor"/>

        <player-list v-if="localPlayer.hasVoted">
            <template slot="icon" slot-scope="{ player }">
                <v-icon medium class="green--text" v-if="player.hasVoted">check</v-icon>
                <v-icon medium v-else>hourglass_empty</v-icon>
            </template>
        </player-list>
            
        <v-layout align-center justify-center v-else class="pl-3">
            <voting-card class="card mr-3" @input="vote" :vote="true"/>
            <voting-card class="card mr-3" @input="vote" :vote="false"/>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import VotingCard from '@/ui/voting-card';
import PlayerList from '@/ui/player-list';
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
        vote(vote) {
            this.$send('SUBMIT_VOTE', { vote: vote });
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.ballot {
    flex: 0 0 auto;
}

.president, .chancellor {
    width: 60%;
    margin-top: @spacer;

    .image {
        width: 100%;
        padding-top: 30%;
        background-size: cover;
        background-position: 0 0;
    }

    .name {
        margin: (@spacer * 0.5) 0 @spacer 0;
        align-self: center;
    }
}

.president .image {
    background-image: url(../../assets/plaque/president.png);
}

.chancellor .image {
    background-image: url(../../assets/plaque/chancellor.png);
}

.player {
    flex-basis: 34%;

    .icon {
        transition: none;
        font-weight: bold;
    }
}

.card {
    flex: 1 1;
}

.voting {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>

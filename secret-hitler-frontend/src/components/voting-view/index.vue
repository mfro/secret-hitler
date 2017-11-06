<template>
    <uikit:simple-page no-footer no-header>
        <v-layout class="ballot mb-2" column align-center>
            <v-layout column justify-center class="president">
                <div class="image"/>
                <span class="title name">Max</span>
            </v-layout>
            <v-layout column justify-center class="chancellor">
                <div class="image"/>
                <span class="title name">Also max</span>
            </v-layout>                
        </v-layout>

        <v-layout wrap align-start align-content-start v-if="localPlayer.hasVoted">
            <v-layout v-for="player in players" :key="player.id"
                align-center px-3 py-2
                class="player">
                <v-icon medium class="icon green--text" v-if="player.hasVoted">check</v-icon>
                <v-icon medium class="icon red--text" v-else>clear</v-icon>

                <span class="player-name ml-3">{{ player.name }}</span>
            </v-layout>
        </v-layout>
            
        <v-layout align-center justify-center v-else class="pl-3">
            <voting-card class="card mr-3" @input="vote" :vote="true"/>
            <voting-card class="card mr-3" @input="vote" :vote="false"/>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import VotingCard from '@/ui/voting-card';

export default {
    components: {
        VotingCard,
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

        players() {
            return [this.localPlayer, ...this.others];
        },

        others() {
            return this.allPlayers.filter(p => p != this.localPlayer && p.isAlive);
        }
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
    width: 70%;
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

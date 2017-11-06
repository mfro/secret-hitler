<template>
    <uikit:simple-page>
        <span slot="header" v-if="!args.pass">The vote failed</span>
        
        <span slot="header" v-if="president">{{ president.name }} is president</span>
        <br slot="header" v-if="president && chancellor">
        <span slot="header" v-if="chancellor">{{ chancellor.name }} is chancellor</span>
        
        <v-layout wrap align-start align-content-start>
            <v-layout v-for="arg in votes" :key="arg.player.id"
                align-center px-3 py-2
                class="player">
                <v-icon medium class="icon green--text" v-if="arg.vote">thumb_up</v-icon>
                <v-icon medium class="icon red--text" v-else>thumb_down</v-icon>

                <span class="player-name ml-3">{{ arg.player.name }}</span>
            </v-layout>
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

        votes() {
            return this.allPlayers.filter(p => p.isAlive).map(p => ({
                player: p,
                vote: this.args.votes.ja.includes(p.id),
            }))
        },

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

.info {
    .text();
    padding: 0 @spacer;
}

.votes {
    margin: @spacer -@spacer -@spacer 0;
}

.player {
    flex-basis: 51%;
    
    .icon {
        transition: none;
        font-weight: bold;
    }
}
</style>

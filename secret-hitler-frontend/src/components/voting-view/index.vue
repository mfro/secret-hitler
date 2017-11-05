<template>
    <uikit:simple-page no-footer>
        <span slot="header" v-if="localPlayer.hasVoted">Waiting for everyone to vote</span>
        <span slot="header" v-else>{{ president.name }} has nominated {{ chancellor.name }}</span>

        <div class="player-list" v-if="localPlayer.hasVoted">
            <player :id="localPlayer.id" />

            <player v-for="player in others" :key="player.id" :id="player.id" />
        </div>

        <div class="cards" v-else>
            <voting-card horizontal class="card" @input="vote" :vote="true"/>
            <voting-card horizontal class="card" @input="vote" :vote="false"/>
        </div>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import Player from './player';
import VotingCard from '@/ui/voting-card';

export default {
    components: {
        Player,
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
            localPlayer: 'localPlayer',
            getPlayer: 'getPlayer',
        }),

        president() {
            return this.getPlayer(this.game.nomination.president);
        },

        chancellor() {
            return this.getPlayer(this.game.nomination.chancellor);
        },

        others() {
            return this.game.players.filter(p => p != this.localPlayer && p.isAlive);
        }
    },

    methods: {
        vote(vote) {
            this.$send('SUBMIT_VOTE', { vote: vote });
        }
    }
};
</script>

<style scoped lang="less">
@import "~style";

.has-voted {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;

    padding: 0 1em;
    box-sizing: border-box;
}

.cards {
    width: 100%;
    height: 100%;
    
    padding: 1em;
    box-sizing: border-box;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .card {
        flex: 0 0 auto;
        width: 70%;
        margin-bottom: 1em;
    }
}

.voting {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>

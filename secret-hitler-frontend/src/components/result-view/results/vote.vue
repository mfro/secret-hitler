<template>
    <div class="vote">
        <div class="info" v-if="!args.pass">
            <!-- <span v-if="args.pass">The vote passed</span> -->
            <span>The vote failed</span>
        </div>
        
        <div class="pres" v-if="president">
            <span>{{ president.name }} is president</span>
        </div>
        
        <div class="chan" v-if="chancellor">
            <span>{{ chancellor.name }} is chancellor</span>
        </div>

        <div class="votes">
            <div class="player" v-for="arg in votes" :key="arg.player.id">
                <voting-card class="card" horizontal :vote="arg.vote"/>
                <span class="name">{{ arg.player.name }}</span>
            </div>
        </div>
    </div>
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
            localPlayer: 'localPlayer',
        }),

        votes() {
            return this.game.players.filter(p => p.isAlive).map(p => ({
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

<style scoped lang="less">
@import "~style";

.vote {
    padding: 1em;
}

.info {
    .text();
}

.pres, .chan {
    .text();
}

.votes {
    display: flex;
    flex-wrap: wrap;
    margin: 1em -1em -1em 0;
    justify-content: space-around;

    .player {
        flex: 0 0 calc((100% / 3) - 1em);
        margin-right: 1em;
        margin-bottom: 1em;
        background-color: white;

        padding: 0.5em;
        box-sizing: border-box;
        border-radius: 0.4em 0.4em 0 0;

        display: flex;
        flex-direction: column;
    }

    .card {
        @margin: calc(-0.5em - 1px);
        margin: @margin @margin .4em @margin;
    }

    .name {
        .text();
        text-align: center;
    }
}
</style>

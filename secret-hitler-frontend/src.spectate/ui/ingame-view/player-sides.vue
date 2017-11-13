<template>
    <v-layout class="root" :class="{ right, dead: !player.isAlive }">
        <v-layout column py-1 class="main" :class="{ right }">
            <div class="nameplate">
                <span class="name">{{ player.name }}</span>
            </div>

            <v-layout column justify-center>
                <template v-if="game.state == 'LOBBY'">
                    <v-icon key="1" class="icon green--text"v-if="player.isReady">check</v-icon>
                    <v-icon key="2" class="icon" v-else>hourglass_empty</v-icon>
                </template>

                <template v-else-if="!player.isAlive">
                    <v-icon key="3" class="icon" v-if="!player.isAlive">mdi-emoticon-dead</v-icon>
                </template>
                
                <div class="mx-3" v-else>
                    <plaque :president="isPresident" :chancellor="isChancellor"/>
                </div>
            </v-layout>
            
            <div v-if="player.isTermLimited" class="term-limit">
                <span class="term-limit">Term limited</span>
            </div>
        </v-layout>

        <div class="contents" v-if="player.isAlive" :class="{ right }">
            <voting-card basis="long" class="fill-height card" :vote="vote" :class="{ hide: !showVote }"/>
        </div>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import Plaque from '@/ui/government/plaque';
import VotingCard from '@/ui/cards/voting';

export default {
    components: {
        Plaque,
        VotingCard,
    },

    props: {
        player: Object,
        right: { type: Boolean, default: false },
    },

    data() {
        return {
            workspace: {
                width: 0,
                height: 0,
            },
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            allPlayers: 'allPlayers',
        }),

        vote() {
            if (this.game.state == 'VOTING')
                return 'back';

            if (!this.lastVoteResult)
                return 'back';

            return this.lastVoteResult.args.votes.ja.find(id => id == this.player.id) != null;
        },

        showVote() {
            if (this.game.state == 'VOTING')
                return this.player.hasVoted;

            return this.lastVoteResult != null;
        },

        lastVoteResult() {
            let event;
            for (let e of this.game.log)
                if (e.name == 'vote')
                    event = e;
            return event;
        },

        isPresident() {
            let id;
            if (this.game.executiveAction)
                id = this.game.executiveAction.president;

            else if (this.game.legislature)
                id = this.game.legislature.president;

            else if (this.game.nomination)
                id = this.game.nomination.president;

            return id == this.player.id;
        },

        isChancellor() {
            let id;
            if (this.game.executiveAction)
                id = this.game.executiveAction.chancellor;

            else if (this.game.legislature)
                id = this.game.legislature.chancellor;

            else if (this.game.nomination)
                id = this.game.nomination.chancellor;

            return id == this.player.id;
        }
    },

    created() {
        this.resize();
    },

    methods: {
        resize() {
            this.workspace = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
    }
};
</script>

<style module lang="less">
@import "~style";

.root {
    flex: 0 1 calc(20% - @spacer);
    
    background-color: white;
    // box-shadow: 0 0 10px gray;

    margin: (@spacer * 0.5) 0;

    border-radius: 0 5px 5px 0;

    &.right {
        border-radius: 5px 0 0 5px;
        flex-direction: row-reverse;
    }
}

.main {
    width: 220px;

    .nameplate {
        text-align: center;

        .name {
            color: inherit;
            font-size: 32px;
        }
    }

    .term-limit {
        text-align: center;
        padding: (@spacer * 0.2);
        font-size: 18px;
    }
}

.contents {
    position: relative;
    
    &.right .card {
        transform: none;
    }

    .card {
        transform: rotate(180deg);

        &.hide {
            opacity: 0;
        }
    }

    &.dead {
        width: 0;
        opacity: 0;
    }
}

.icon {
    font-size: 4rem;
}
</style>

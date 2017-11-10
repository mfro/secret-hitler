<template>
    <v-layout class="root">
        <v-layout v-for="player in allPlayers" :key="player.id" column align-center class="player">
            <v-layout align-center class="header">
                <v-layout justify-start align-center class="header-spacer">
                </v-layout>

                <span class="title name">{{ player.name }}</span>

                <v-layout justify-end align-center class="header-spacer">
                    <template v-if="player.isAlive && game.state == 'VOTING'">
                        <!-- <v-icon medium v-if="player.hasVoted" class="voted green--text">check</v-icon> -->
                        <v-icon medium v-if="!player.hasVoted" class="voted">hourglass_empty</v-icon>
                    </template>

                    <template v-else-if="player.isAlive && typeof player.vote == 'boolean'">
                        <v-icon medium v-if="player.vote !== null && player.vote" class="voted green--text">thumb_up</v-icon>
                        <v-icon medium v-else class="voted red--text">thumb_down</v-icon>
                    </template>
                </v-layout>
            </v-layout>

            <v-layout column align-center justify-end class="spacer">
                <v-layout align-center justify-center class="dead-container">
                    <v-icon v-if="!player.isAlive" class="dead">mdi-emoticon-dead</v-icon>
                </v-layout>

                <plaque class="plaque" :president="president == player" :chancellor="chancellor == player"/>
            </v-layout>
        </v-layout>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import Plaque from '@/ui/plaque';

export default {
    components: {
        Plaque,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            allPlayers: 'allPlayers',
        }),

        president() {
            let id;
            if (this.game.executiveAction)
                id = this.game.executiveAction.president;
            
            else if (this.game.nomination)
                id = this.game.nomination.president;

            return this.getPlayer(id);
        },

        chancellor() {
            let id;
            if (this.game.executiveAction)
                id = this.game.executiveAction.chancellor;
            
            else if (this.game.nomination)
                id = this.game.nomination.chancellor;

            return this.getPlayer(id);
        }
    }
  
};
</script>

<style module lang="less">
@import "~style";

.root {
    flex-wrap: wrap;
    background: white;
    box-shadow: 0 0 25px -1px gray;
}

.player {
    flex: 0 0 (100% / 5);
    border-right: 1px solid lightgray;
    border-bottom: 1px solid lightgray;

    padding: @spacer 0;
}

.header {
    width: 100%;
    padding: 0 @spacer;
}

.header-spacer {
    flex: 1 1 0;
}

.voted {
    font-weight: bold;
}

.spacer {
    width: 100%;
    min-height: 80px;
    position: relative;
}

.dead-container {
    position: absolute;
    width: 100%;
    height: (100% + @spacer);
    top: 0;
    left: 0;
}

.dead {
    font-size: 4rem;
}

.plaque {
    width: 90%;
    max-width: 14em;
}

</style>

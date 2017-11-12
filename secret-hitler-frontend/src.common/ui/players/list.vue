<template>
    <v-list v-if="large">
        <slot name="prefix"/>
        
        <v-list-tile v-for="player in options" :key="player.id"
            align-center px-3 py-2
            class="large-player">
            
            <v-list-tile-action>
                <slot name="icon" class="icon" :player="player"/>
            </v-list-tile-action>

            <v-list-tile-title>
                <span class="player-name">{{ player.name }}</span>
            </v-list-tile-title>
        </v-list-tile>

        <slot name="postfix"/>
    </v-list>

    <v-layout v-else wrap align-start align-content-start>
        <v-layout v-for="player in options" :key="player.id"
            align-center px-3 py-2
            class="player">
            
            <slot name="icon" class="icon" :player="player"/>

            <span class="player-name ml-3">{{ player.name }}</span>
        </v-layout>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: {
        large: { type: Boolean, default: false, },
        larger: { type: Boolean, default: false, },
        filter: { type: Function, default: null },
    },

    computed: {
        ...mapGetters({
            game: 'game',
            allPlayers: 'allPlayers',
            localPlayer: 'localPlayer',
        }),

        options() {
            return this.allPlayers.filter(p => {
                if (p.isAlive === false)
                    return false;

                return !this.filter || this.filter(p)
            });
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.large-player {
    :global(.material-icons.icon) {
        // font-weight: bold;
        transition: none;
    }
}

.player {
    flex-basis: 34%;

    :global(.material-icons.icon) {
        // font-weight: bold;
        transition: none;
    }
}
</style>

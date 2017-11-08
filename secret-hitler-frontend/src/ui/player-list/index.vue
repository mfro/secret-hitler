<template>
    <v-layout wrap align-start align-content-start>
        <v-layout v-for="player in options" :key="player.id"
            align-center px-3 py-2
            class="player" :class="playerClass">
            
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

        playerClass() {
            if (this.large)
                return 'single';

            return 'duplex';
        }
    },
};
</script>

<style module lang="less">
@import "~style";

.preview-deck {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
}

.player {
    flex-basis: 51%;
    
    &.duplex {
        flex-basis: 34%;
    }

    :global(.material-icons.icon) {
        font-weight: bold;
        transition: none;
    }
}
</style>

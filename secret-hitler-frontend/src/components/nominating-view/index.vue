<template>
    <uikit:simple-page v-if="isPresident">
        <span slot="header">Select a player to nominate</span>
        
        <player-selector v-model="selected" :filter="isValid"/>

        <v-layout slot="footer" align-center justify-center>
            <v-btn :disabled="!selected" @click="nominate()">Nominate</v-btn>
        </v-layout>
    </uikit:simple-page>

    <uikit:simple-page v-else>
        <span slot="header">{{ president.name}} is nominating a chancellor</span>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import PlayerSelector from '@/ui/player-selector';

export default {
    components: {
        PlayerSelector,
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
            localPlayer: 'localPlayer',
        }),

        president() {
            return this.getPlayer(this.game.nomination.president);
        },

        isPresident() {
            return this.president == this.localPlayer;
        },
    },

    methods: {
        isValid(p) {
            return p.isAlive && !p.isTermLimited && !p.isLocalPlayer;
        },

        nominate() {
            this.$send('NOMINATE', { playerId: this.selected.id });
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.nominating-view {
    width: 100%;
    height: 100%;
}

.is-president {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    overflow: auto;

    .list {
        flex: 1 1;
        overflow: auto;
    }
}

.bottom {
    display: flex;
    justify-content: center;
}
</style>

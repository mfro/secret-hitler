<template>
    <uikit:simple-page>
        <span slot="header">Choose a player to assassinate</span>

        <player-selector v-model="target" :filter="filter"/>

        <div slot="footer" class="bottom">
            <uikit:button @click="submit()">Shoot</uikit:button>
        </div>
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
            target: null,
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            localPlayer: 'localPlayer',
        }),

        action() {
            return this.game.executiveAction;
        },
    },

    methods: {
        filter(p) {
            return p.isAlive;
        },

        submit() {
            this.$send('SET_ACTION_TARGET', { target: this.target.id });
        },
    },
};
</script>

<style scoped lang="less">
@import "~style";

.preview-deck {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
}

.card {
    height: 16em;
}

.bottom {
    flex: 0 0 auto;
    margin: 1em;
    display: flex;
    justify-content: center;
}
</style>

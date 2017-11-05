<template>
    <div class="inspect">
        <player-selector v-model="target" :filter="filter"/>

        <div class="bottom">
            <uikit:button :disabled="!target" @click="submit()">Inspect</uikit:button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicyCard from '@/ui/policy-card';
import PlayerSelector from '@/ui/player-selector';

export default {
    components: {
        PolicyCard,
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
            return p != this.localPlayer && p.isAlive;
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

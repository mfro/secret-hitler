<template>
    <uikit:simple-page>
        <span slot="header">These are the top three cards in the deck</span>

        <div class="preview-deck">
            <policy-card :policy="card" v-for="(card, i) of action.learned" :key="i"/>
        </div>

        <div slot="footer" class="bottom">
            <uikit:button @click="complete()">Ok</uikit:button>
        </div>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicyCard from '@/ui/policy-card';

export default {
    components: {
        PolicyCard,
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
        complete() {
            this.$send('COMPLETE_ACTION');
        }
    }
};
</script>

<style scoped lang="less">
@import "~style";

.preview-deck {
    display: flex;
    justify-content: center;

    padding: 1em 0 1em 1em;
    box-sizing: border-box;
}

.card {
    height: 16em;
    margin-right: 1em;
}

.bottom {
    display: flex;
    justify-content: center;
}
</style>

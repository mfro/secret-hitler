<template>
    <uikit:simple-page>
        <span slot="header">Select a policy to enact</span>

        <div class="cards">
            <policy-card v-for="(card, i) in session.chancellorCards" :key="i" :policy="card" @input="selected = i" :class="{ active: selected == i }"/>
        </div>

        <div slot="footer" class="bottom">
            <uikit:button :disabled="!isReady" @click="submit()">Enact</uikit:button>
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

    data() {
        return {
            selected: -1,
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            localPlayer: 'localPlayer',
        }),

        session() {
            return this.game.legislature;
        },

        isReady() {
            return this.selected != -1;
        }
    },

    methods: {
        submit() {
            let is = [0, 1];
            is.splice(is.indexOf(this.selected), 1);

            let discard = this.session.chancellorCards[is[0]];

            this.$send('LEGISLATURE_DISCARD', { card: discard });
        }
    }
}
</script>

<style lang="less" scoped>
@import "~style";

.header {
    .state-header();
}

.cards {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 1em 1em 0 0;

    > div {
        flex: 0 1 calc(50% - 1em);
        margin-left: 1em;
        margin-bottom: 1em;

        &.active {
            box-shadow: 0 0 0 4px #4CAF50;
        }
    }
}

.bottom {
    display: flex;
    justify-content: center;
}
</style>

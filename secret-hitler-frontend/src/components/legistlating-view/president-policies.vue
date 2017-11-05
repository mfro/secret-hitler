<template>
    <uikit:simple-page>
        <span slot="header">Select 2 policies to pass to the chancellor</span>

        <div class="cards">
            <policy-card v-for="(card, i) in session.presidentCards" :key="i" :policy="card" @input="select(i)" :class="{ active: selected.indexOf(i) != -1 }"/>
        </div>

        <div slot="footer" class="bottom">
            <uikit:button :disabled="!isReady" @click="submit()">Submit</uikit:button>
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
            selected: [],
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
            return this.selected.length == 2;
        }
    },

    methods: {
        select(i) {
            console.log(i);

            let index = this.selected.indexOf(i);
            if (index < 0)
                this.selected.push(i);
            else
                this.selected.splice(index, 1);
        },

        submit() {
            if (this.session.president == this.localPlayer.id) {
                let is = [0, 1, 2];
                for (let pass of this.selected)
                    is.splice(is.indexOf(pass), 1);

                let discard = this.session.presidentCards[is[0]];

                this.$send('LEGISLATURE_DISCARD', { card: discard });
            }
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

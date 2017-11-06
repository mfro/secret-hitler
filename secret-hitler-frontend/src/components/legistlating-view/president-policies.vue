<template>
    <uikit:simple-page>
        <span slot="header">Select 2 policies to pass to the chancellor</span>

        <v-layout align-center py-3 pl-3>
            <v-flex v-for="(card, i) in session.presidentCards" :key="i" class="card-box mr-3">
                <policy-card :policy="card" @input="select(i)" :class="{ active: selected.indexOf(i) != -1 }"/>
            </v-flex>
        </v-layout>

        <v-layout slot="footer" align-center justify-center>
            <v-btn :disabled="!isReady" @click="submit()">Submit</v-btn>
        </v-layout>
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

<style lang="less" module>
@import "~style";

.card-box {
    flex-basis: 0;

    .active {
        box-shadow: 0 0 0 4px #4CAF50;
    }
}
</style>

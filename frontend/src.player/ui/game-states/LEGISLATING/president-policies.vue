<template>
    <uikit:simple-page>
        <span slot="header">Select 2 policies to pass to the chancellor</span>

        <policy-selector :cards="session.presidentCards" v-model="discarding"/>
        </v-layout>

        <v-layout slot="footer" align-center justify-center>
            <v-btn :disabled="!isReady" @click="submit()">Submit</v-btn>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicySelector from './policy-selector';

export default {
    components: {
        PolicySelector,
    },

    data() {
        return {
            discarding: null,
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
            return this.discarding != null;
        }
    },

    methods: {
        submit() {
            if (this.session.president == this.localPlayer.id) {
                this.$send('LEGISLATURE_DISCARD', { card: this.discarding });
            }
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.card-box {
    flex-basis: 0;

    .active {
        box-shadow: 0 0 0 4px #4CAF50;
    }
}
</style>

<template>
    <uikit:simple-page>
        <span slot="header">Game over!</span>

        <v-layout ma-3>
            <span class="info" v-if="result == 'FASCIST_HITLER'">
                Hitler was elected chancellor
            </span>
            
            <span class="info" v-else-if="result == 'LIBERAL_HITLER'">
                Hitler is dead
            </span>
            
            <span class="info" v-else-if="result == 'FASCIST_POLICY'">
                6 fascist policies were enacted
            </span>
            
            <span class="info" v-else-if="result == 'LIBERAL_POLICY'">
                5 liberal policies were enacted
            </span>
        </v-layout>

        <v-layout slot="footer" align-center justify-center>
            <v-btn @click="submit()">Continue</v-btn>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            game: 'game',
        }),

        result() {
            return this.game.victory;
        }
    },

    methods: {
        submit() {
            this.$store.commit('RESET');
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.info {
    .text();
}
</style>

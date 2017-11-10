<template>
    <uikit:simple-page>
        <span slot="header">Game over!</span>

        <v-layout ma-3 column>
            <span class="info" v-if="result == 'FASCIST_HITLER'">
                Hitler was elected chancellor
            </span>
            
            <span class="info" v-else-if="result == 'LIBERAL_HITLER'">
                Hitler was assassinated
            </span>
            
            <span class="info" v-else-if="result == 'FASCIST_POLICY'">
                6 fascist policies were enacted
            </span>
            
            <span class="info" v-else-if="result == 'LIBERAL_POLICY'">
                5 liberal policies were enacted
            </span>

            <v-layout align-center justify-center>
                <div class="policy" :class="team"/>
            </v-layout>
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
        },

        team() {
            switch (this.game.victory) {
                case 'FASCIST_HITLER':
                case 'FASCIST_POLICY':
                    return 'fascist';
                case 'LIBERAL_HITLER':
                case 'LIBERAL_POLICY':
                    return 'liberal';
            }
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

.policy {
    width: 200px;
    height: 200px;
    background-size: contain;
    background-position: center;

    -webkit-mask-size: contain;
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;

    &.liberal {
        // background-image: url('../../../../assets/misc/dove.svg');
        transform: rotateZ(-90deg);

        -webkit-mask-image: url('../../assets/misc/dove.svg');
        background-color: rgba(0, 145, 179, 0.75);
        // color: #00afd8;

    }
    &.fascist {
        // background-image: url('../../../../assets/misc/skull.svg');
        transform: rotateZ(90deg);
        
        -webkit-mask-image: url('../../assets/misc/skull.svg');
        background-color: rgba(214, 13, 0, 0.75);
        // color: rgb(214, 13, 0);
    }
}
</style>

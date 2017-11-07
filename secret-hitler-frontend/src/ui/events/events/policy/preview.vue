<template>
    <v-list-tile>
        <v-list-tile-action>
            <span class="policy" :class="policy"></span>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title>A {{ policy }} policy was enacted</v-list-tile-title>
            <v-list-tile-sub-title v-if="!args.government">Anarchy</v-list-tile-sub-title>
        </v-list-tile-content>
    </v-list-tile>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: {
        args: Object,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            localPlayer: 'localPlayer',
        }),

        policy() {
            return this.args.policy.toLowerCase();
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.policy {
    width: 2rem;
    height: 2rem;
    background-size: contain;
    background-position: center;

    background-color: rgba(0,0,0,0.54);

    -webkit-mask-size: contain;
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;

    &.liberal {
        // background-image: url('../../../../assets/misc/dove.svg');
        transform: rotateZ(-90deg);

        -webkit-mask-image: url('../../../../assets/misc/dove.svg');
        background-color: rgba(0, 145, 179, 0.75);
        // color: #00afd8;

    }
    &.fascist {
        // background-image: url('../../../../assets/misc/skull.svg');
        transform: rotateZ(90deg);
        
        -webkit-mask-image: url('../../../../assets/misc/skull.svg');
        background-color: rgba(214, 13, 0, 0.75);
        // color: rgb(214, 13, 0);
    }
}
</style>

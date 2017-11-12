<template>
    <uikit:simple-page no-footer>
        <span slot="header">{{ target.name }} was shot by {{ president.name }}</span>

        <v-layout column>
            <v-flex class="art"/>
        </v-layout>
    </uikit:simple-page>
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

        president() {
            return this.getPlayer(this.args.president);
        },

        target() {
            return this.getPlayer(this.args.target);
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.art {
    background-image: url(../../../../assets/misc/gun.svg);
    background-size: contain;
    background-position: center;
    margin: (@spacer * 2);
}

.icon {
    font-size: 2
}
</style>

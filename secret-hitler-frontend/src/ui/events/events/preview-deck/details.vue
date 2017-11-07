<template>
    <uikit:simple-page no-footer>
        <span slot="header">{{ president.name }} looked at the top 3 cards of the deck</span>
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
    },
};
</script>

<style module lang="less">
@import "~style";
</style>

<template>
    <div class="divider"/>
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
    },
};
</script>

<style module lang="less">
@import "~style";

.divider {
    background-color: gray;
    margin: @spacer;
    flex: 0 0 1px;

    &:last-child {
        display: none;
    }
}
</style>

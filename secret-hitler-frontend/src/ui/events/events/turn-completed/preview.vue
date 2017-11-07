<template>
    <div class="group">
        <v-divider class="divider"></v-divider>
        <v-subheader inset>Turn {{ args.turn }}</v-subheader>
    </div>
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

.group:first-child {
    .divider {
        display: none;
    }
}
</style>

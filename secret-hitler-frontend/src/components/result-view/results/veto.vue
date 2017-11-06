<template>
    <div class="enact pa-3">
        <div class="info">
            <span>The legislature agreed to a veto</span>
        </div>
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

.info {
    .text();
}
</style>

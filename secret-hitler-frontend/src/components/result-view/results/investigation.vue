<template>
    <div class="investigation pa-3">
        <div class="info">
            <span>The president investigated {{ player.name }}</span>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import PolicyCard from '@/ui/policy-card';

export default {
    components: {
        PolicyCard,
    },

    props: {
        args: Object,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            localPlayer: 'localPlayer',
        }),

        player() {
            return this.getPlayer(this.args.player);
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.info {
    .text();
}
</style>

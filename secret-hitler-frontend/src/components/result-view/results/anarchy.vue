<template>
    <div class="anarchy pa-3">
        <div class="info">
            <span>A {{ type }} policy was enacted by anarchy</span>
        </div>

        <div class="card-container mt-3">
            <policy-card :policy="args.policy"/>
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

        type() {
            return this.args.policy.toLowerCase();
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.info {
    .text();
}

.card-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.card {
    height: 16em;
}
</style>

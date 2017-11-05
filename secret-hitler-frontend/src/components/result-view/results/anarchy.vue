<template>
    <div class="anarcy">
        <div class="info">
            <span>A {{ type }} policy was enacted by anarchy</span>
        </div>

        <div class="card-container">
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

<style scoped lang="less">
@import "~style";

.anarcy {
    padding: 1em;
}

.info {
    .text();
}

.card-container {
    margin-top: 1em;
    height: 16em;

    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>

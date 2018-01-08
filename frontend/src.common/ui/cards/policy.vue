<template>
    <card :basis="basis" no-border :card="card" :value="value" :horizontal="horizontal" @input="$emit('input', $event)"/>
</template>

<script>
import Card from './card';

import * as cards from '@/cards';

export default {
    components: {
        Card,
    },

    props: {
        value: { type: Boolean, default: true },
        basis: String,
        policy: String,
        horizontal: { type: Boolean, default: false },
    },

    computed: {
        card() {
            if (this.policy == 'LIBERAL')
                return cards.liberal_policy;

            if (this.policy == 'FASCIST')
                return cards.fascist_policy;
        }
    }
};
</script>

<style module lang="less">
@import "~style";
</style>
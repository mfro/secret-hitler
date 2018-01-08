<template>
    <card :basis="basis" :card="card" :value="value" :horizontal="horizontal" @input="$emit('input', !value)"/>
</template>

<script>
import Card from './card';

import * as cards from '@/cards';

export default {
    components: {
        Card,
    },

    props: {
        role: String,
        basis: String,
        value: Boolean,
        horizontal: { type: Boolean, default: false, },
    },

    computed: {
        card() {
            return cards.getMembershipCard(this.role);
        }
    }
};
</script>

<style module lang="less">
@import "~style";
</style>
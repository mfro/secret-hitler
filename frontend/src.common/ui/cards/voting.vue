<template>
    <card :basis="basis" no-border :card="card" :value="vote != 'back'" :horizontal="horizontal" @input="$emit('input', vote)"/>
</template>

<script>
import Card from './card';

import * as cards from '@/cards';

export default {
    components: {
        Card,
    },

    props: {
        vote: { required: true },
        basis: String,
        horizontal: { type: Boolean, default: false },
    },

    computed: {
        card() {
            if (this.vote)
                return cards.ja_card;

            return cards.nein_card;
        }
    }
};
</script>

<style module lang="less">
@import "~style";
</style>
<template>
    <card :card="card" :value="true" :horizontal="horizontal" @input="$emit('input', vote)"/>
</template>

<script>
import Card from './card';

import * as cards from '@/cards';

export default {
    components: {
        Card,
    },

    props: {
        vote: Boolean,
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

<style scoped lang="less">
@import "~style";

.policy-card {
    
}
</style>
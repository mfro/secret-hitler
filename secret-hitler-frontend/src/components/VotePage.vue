<template>
    <div class="vote-page">
        <card v-model="vote" :card="card" />

        <uikit-button @click="$store.dispatch('setVoting', false)">Back</uikit-button>
    </div>
</template>

<script>
import Card from './Card.vue';
import * as cards from '@/cards';

export default {
    components: {
        Card,
    },

    data() {
        return {
            vote: true,
            card: cards.voting_card
        };
    },

};
</script>

<style lang="less" scoped>
.vote-page {
    display: flex;
    align-items: center;
    flex-direction: column;
}

.card {
    width: 60%;
    margin: 20vw !important;
}
</style>

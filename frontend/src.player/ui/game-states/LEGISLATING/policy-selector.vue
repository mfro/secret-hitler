<template>
    <v-layout align-center py-3 pl-3>
        <v-flex v-for="(card, i) in cards" :key="i" class="card-box mr-3">
            <policy-card :policy="card" :value="flipped" @input="onClick(i)" :class="{ active: selected.indexOf(i) != -1 }"/>
        </v-flex>
    </v-layout>
</template>

<script>
import PolicyCard from '@/ui/cards/policy';

export default {
    components: {
        PolicyCard,
    },

    props: {
        value: String,
        cards: Array,
    },

    data() {
        return {
            flipped: false,
            selected: [],
        };
    },

    methods: {
        onClick(i) {
            if (!this.flipped) {
                this.flipped = true;
                this.$emit('input', null);
                return;
            } else {
                let index = this.selected.indexOf(i);
                if (index < 0)
                    this.selected.push(i);
                else
                    this.selected.splice(index, 1);
            }

            let is = this.cards.map((p, i) => i);
            for (let pass of this.selected)
                is.splice(is.indexOf(pass), 1);

            if (is.length != 1) {
                this.$emit('input', null);
            } else {
                this.$emit('input', this.cards[is[0]]);
            }
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.card-box {
    flex-basis: 0;

    .active {
        box-shadow: 0 0 0 4px #4CAF50;
    }
}
</style>
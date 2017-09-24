<template>
    <div class="assignment">
        <div class="cards">
            <card v-model="roleFlipped" :card="roleCard" />
            <card v-model="membershipFlipped" :card="membershipCard" />
        </div>

        <div class="info" v-if="roleFlipped">
            <span class="hitler-info" v-if="assignment.role == 'hitler'">
                You are Hitler.
            </span>

            <span class="fascist-info" v-else-if="assignment.role == 'fascist'">
                You are a fascist.
            </span>

            <span class="liberal-info" v-else-if="assignment.role == 'liberal'">
                You are a liberal.
            </span>

            <span class="known" v-if="assignment.known.length > 0">
                The fascists you know are: {{ knownNames }}
            </span>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import * as cards from '@/cards';

import Card from './Card.vue';

export default {
    components: {
        Card,
    },

    data() {
        return {
            roleFlipped: false,
            membershipFlipped: false,
        };
    },

    computed: {
        ...mapGetters({
            allPlayers: 'allPlayers',
            assignment: 'assignment',
        }),

        membershipCard() {
            return cards.getMembershipCard(this.assignment.role);
        },

        roleCard() {
            return cards.getRoleCard(this.assignment.role);
        },

        knownNames() {
            return this.assignment.known.map(id => this.allPlayers.find(p => p.id == id).name).join(', ');
        }
    },
};
</script>

<style lang="less" scoped>
.assignment {
    display: flex;
    flex-direction: column;
}

.cards {
    display: flex;
    padding: 10px 0 0 10px;
}

.info {
    padding: 10px;
    font-family: "courier-prime", Courier, sans-serif;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: -0.01em;
}
</style>

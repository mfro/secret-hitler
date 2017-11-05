<template>
    <div class="role-assignment">
        <div class="cards">
            <card v-model="roleFlipped" :card="roleCard" />
            <card v-model="membershipFlipped" :card="membershipCard" />
        </div>

        <div class="info" v-if="roleFlipped">
            <div class="hitler-info" v-if="assignment.role == 'HITLER'">
                <span>You are Hitler</span>
            </div>

            <div class="fascist-info" v-else-if="assignment.role == 'FASCIST'">
                <span>You are a fascist</span>
            </div>

            <div class="liberal-info" v-else-if="assignment.role == 'LIBERAL'">
                <span>You are a liberal</span>
            </div>

            <div class="known" v-if="hitler">
                <span>{{ hitler.name }} is Hitler</span>
            </div>

            <template v-if="fascists">
                <div class="known" v-for="fascist in fascists" :key="fascist.id">
                    <span>{{ fascist.name }} is a fascist</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import * as cards from '@/cards';

import Card from '@/ui/card';

export default {
    components: {
        Card,
    },

    data() {
        return {
            voteNoCard: cards.nein_card,
            voteYesCard: cards.ja_card,

            roleFlipped: false,
            membershipFlipped: false,
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            localPlayer: 'localPlayer',
        }),

        assignment() {
            return this.localPlayer.assignment;
        },

        membershipCard() {
            return cards.getMembershipCard(this.assignment.role);
        },

        roleCard() {
            return cards.getRoleCard(this.assignment.role);
        },

        hitler() {
            if (!this.assignment.hitler) return null;
            return this.getPlayer(this.assignment.hitler);
        },

        fascists() {
            if (!this.assignment.fascists) return null;
            return this.assignment.fascists.map(this.getPlayer);
        }
    },

};
</script>

<style scoped lang="less">
@import "~style";

.cards {
    flex: 0 0 auto;
    display: flex;
    padding: 1em 0 1em 1em;
    box-sizing: border-box;

    > div {
        flex: 1;
        margin-right: 1em;
    }
}

.info {
    padding: 10px;
    font-family: "courier-prime", Courier, sans-serif;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: -0.01em;

    display: flex;
    flex-direction: column;
}
</style>

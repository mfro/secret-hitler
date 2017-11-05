<template>
    <president-policies v-if="state == 'pres_cards'"/>
    
    <chancellor-policies v-else-if="state == 'chan_cards'"/>
        
    <div class="legistlature-view" v-else>
        <div class="president" v-if="state == 'pres_veto'">
            <div class="header">
                <span>A veto has been requested</span>
            </div>

            <uikit-button>Accept veto</uikit-button>
            <uikit-button>Reject veto</uikit-button>
        </div>

        <div class="president" v-else-if="state == 'pres_waiting'">
            <div class="header">
                <span>Waiting for the chancellor...</span>
            </div>
        </div>
        
        <div class="chancellor" v-else-if="state == 'chan_veto'">
            <div class="header">
                <span>Waiting for the president...</span>
            </div>
        </div>

        <div class="chancellor" v-else-if="state == 'chan_waiting'">
            <div class="header">
                <span>Waiting for the president...</span>
            </div>
        </div>

        <div class="bystander" v-else>
            <div class="header">
                <span>The legislature is in session</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Player from './player';
import PolicyCard from '@/ui/policy-card';

import PresidentPolicies from './president-policies';
import ChancellorPolicies from './chancellor-policies';

export default {
    components: {
        Player,
        PolicyCard,
        PresidentPolicies,
        ChancellorPolicies,
    },

    data() {
        return {
            selected: [],
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            localPlayer: 'localPlayer',
        }),

        session() {
            return this.game.legislature;
        },

        state() {
            if (this.session.president == this.localPlayer.id) {
                if (this.session.chancellorCards == null)
                    return 'pres_cards';
                if (this.session.vetoRequested && this.session.vetoAccepted === null)
                    return 'pres_veto';
                return 'pres_waiting';
            }

            if (this.session.chancellor == this.localPlayer.id) {
                if (this.session.chancellorCards != null)
                    return 'chan_cards';
                if (this.session.vetoRequested && this.session.vetoAccepted === null)
                    return 'chan_veto';
                return 'chan_waiting';
            }

            return 'bystander';
        },

        isReady() {
            if (this.session.president == this.localPlayer.id)
                return this.selected.length == 2;

            if (this.session.chancellor == this.localPlayer.id)
                return this.selected.length == 1;
        }
    },

    methods: {
        select(i) {
            console.log(i);

            let index = this.selected.indexOf(i);
            if (index < 0)
                this.selected.push(i);
            else
                this.selected.splice(index, 1);
        },

        submit() {
            if (this.session.president == this.localPlayer.id) {
                let is = [0, 1, 2];
                for (let pass of this.selected)
                    is.splice(is.indexOf(pass), 1);

                let discard = this.session.presidentCards[is[0]];

                this.$send('LEGISLATURE_DISCARD', { card: discard });
            }
        }
    }
};
</script>

<style scoped lang="less">
@import "~style";

.legistlature-view {
    width: 100%;
    height: 100%;
}

.header {
    .state-header();
}

.cards {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 1em 1em 0 0;

    > div {
        flex: 0 1 calc(50% - 1em);
        margin-left: 1em;
        margin-bottom: 1em;

        &.active {
            box-shadow: 0 0 0 4px #4CAF50;
        }
    }
}

.bottom {
    margin: 1em 1em 0 1em;
    display: flex;
    justify-content: center;
}
</style>

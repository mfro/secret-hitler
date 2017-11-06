<template>
    <president-policies v-if="state == 'pres_cards'"/>
    
    <chancellor-policies v-else-if="state == 'chan_cards'"/>
    
    <uikit:simple-page v-else-if="state == 'pres_veto'">
        <span slot="header">The chancellor has requested a veto</span>

        <v-layout slot="footer" align-center justify-center>
            <v-btn @click="veto(false)">Reject veto</v-btn>
            <v-btn @click="veto(true)">Accept veto</v-btn>
        </v-layout>
    </uikit:simple-page>
        
    <div class="legistlature-view" v-else>
        <div class="president" v-if="state == 'pres_waiting'">
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

import PolicyCard from '@/ui/policy-card';

import PresidentPolicies from './president-policies';
import ChancellorPolicies from './chancellor-policies';

export default {
    components: {
        PolicyCard,
        PresidentPolicies,
        ChancellorPolicies,
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
                if (this.session.vetoRequested && this.session.vetoAccepted === null)
                    return 'pres_veto';
                if (this.session.chancellorCards == null)
                    return 'pres_cards';
                return 'pres_waiting';
            }

            if (this.session.chancellor == this.localPlayer.id) {
                if (this.session.vetoRequested && this.session.vetoAccepted === null)
                    return 'chan_veto';
                if (this.session.chancellorCards != null)
                    return 'chan_cards';
                return 'chan_waiting';
            }

            return 'bystander';
        },
    },

    methods: {
        veto(accept) {
            this.$send('LEGISLATURE_VETO', { response: accept });
        },
    }
};
</script>

<style module lang="less">
@import "~style";

.legistlature-view {
    width: 100%;
    height: 100%;
}

.header {
    .state-header();
    margin: @spacer @spacer 0 @spacer;
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

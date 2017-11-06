<template>
    <uikit:simple-page no-header>
        <v-flex class="contents">
            <component :is="'result-' + result.name" :args="result.args"/>
        </v-flex>

        <v-layout slot="footer" align-center justify-center>
            <v-btn @click="accept()">Ok</v-btn>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import ResultVote from './results/vote';
import ResultVeto from './results/veto';
import ResultEnact from './results/enact';
import ResultAnarchy from './results/anarchy';
import ResultInvestigation from './results/investigation';
import ResultAssassination from './results/assassination';
import ResultRoleAssignment from './results/role-assignment';
import ResultSpecialElection from './results/special-election';

export default {
    components: {
        ResultVote,
        ResultVeto,
        ResultEnact,
        ResultAnarchy,
        ResultInvestigation,
        ResultAssassination,
        ResultRoleAssignment,
        ResultSpecialElection
    },

    props: {
        result: Object,
    },

    methods: {
        accept() {
            this.$store.commit('POP_RESULT');
        }
    }
};
</script>

<style lang="less" module>
.result-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>

<template>
    <uikit:simple-page no-header>
        <!-- <span class="raw">{{ result }}</span> -->

        <div class="contents">
            <component :is="'result-' + result.name" :args="result.args"/>
        </div>

        <div slot="footer" class="bottom">
            <uikit:button @click="accept()">Ok</uikit:button>
        </div>
    </uikit:simple-page>
</template>

<script>
import ResultVote from './results/vote';
import ResultEnact from './results/enact';
import ResultAnarchy from './results/anarchy';
import ResultRoleAssignment from './results/role-assignment';

export default {
    components: {
        ResultVote,
        ResultEnact,
        ResultAnarchy,
        ResultRoleAssignment,
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

<style lang="less" scoped>
.result-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.contents {
    flex: 1;
}

.bottom {
    display: flex;
    justify-content: center;
}
</style>

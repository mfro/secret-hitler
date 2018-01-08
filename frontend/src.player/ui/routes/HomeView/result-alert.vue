<template>
    <uikit:simple-page no-header>
        <event-details :event="result"/>

        <v-layout slot="footer" align-center justify-center>
            <v-btn @click="accept()">Ok</v-btn>
        </v-layout>
    </uikit:simple-page>
</template>

<script>
import EventDetails from '@player/ui/events/details';

export default {
    components: {
        EventDetails
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

<style module lang="less">
.result-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>

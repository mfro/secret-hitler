<template>
    <uikit:simple-page no-header no-footer>
        <v-list two-line class="my-list">
            <event-preview v-for="(event, i) in log" :key="log.length - i" :event="event" @details="onDetails(event)"/>
        </v-list>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import EventPreview from './preview';

export default {
    components: {
        EventPreview
    },

    computed: {
        ...mapGetters({
            game: 'game',
        }),

        log() {
            return this.game.log.slice().reverse();
        }
    },

    methods: {
        onDetails(e) {
            this.$emit('details', e);
        }
    }
};
</script>

<style module lang="less">
@import "~style";
</style>

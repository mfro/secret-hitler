<template>
    <uikit:simple-page no-header no-footer>
        <v-list two-line class="my-list">
            <event-preview v-for="(event, i) in log" :key="log.length - i" :event="event" @details="onDetails(event)"/>
        </v-list>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import EventPreview from '@/ui/events/preview';

export default {
    components: {
        EventPreview
    },

    computed: {
        ...mapGetters({
            game: 'game',
        }),

        log() {
            return this.game.log.reverse();
        }
    },

    methods: {
        onDetails(e) {
            console.log(e)
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.my-list :global(.list__tile) {
    // height: 60px;
}
</style>

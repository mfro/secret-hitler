<template>
    <event-details :event="event" />
</template>

<script>
import { mapGetters } from 'vuex';

import EventDetails from '@player/ui/events/details';

export default {
    components: {
        EventDetails
    },

    props: {
        index: String,
    },

    computed: {
        ...mapGetters({
            game: 'game',
        }),

        event() {
            return this.game.log[this.index];
        }
    }
};
</script>

<style module lang="less">
@import "~style";
</style>

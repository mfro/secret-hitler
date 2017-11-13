<template>
    <v-layout fill-height justify-end>
        <event-preview v-for="(event, i) in log" :key="i" :event="event" @details="onDetails(event)"/>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import EventPreview from '@spectate/ui/events/preview';

export default {
    components: {
        EventPreview
    },

    computed: {
        ...mapGetters({
            game: 'game',
        }),

        log() {
            return this.game.log;
        }
    },

    methods: {
        onDetails(e) {
            let i = this.game.log.indexOf(e);
            this.$router.push('/log/' + i);
        }
    }
};
</script>

<style module lang="less">
@import "~style";
</style>

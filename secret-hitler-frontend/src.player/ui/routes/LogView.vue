<template>
    <event-log @details="onDetails"/>
</template>

<script>
import { mapGetters } from 'vuex';

import EventLog from '@/ui/events/log';

export default {
    components: {
        EventLog
    },

    computed: {
        ...mapGetters({
            game: 'game',
        }),
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

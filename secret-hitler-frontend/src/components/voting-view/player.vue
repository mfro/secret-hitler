<template>
    <div class="player">
        <div class="status" :class="{ ready: player.hasVoted }" />
        <div class="header">
            <span>{{ player.name }}</span>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: {
        id: Number,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
        }),

        player() {
            return this.getPlayer(this.id);
        },
    },
};
</script>

<style scoped lang="less">
@import "~style";

.player {
    display: flex;

    margin: 1em 1em 0 1em;
    box-shadow: 0 0 10px gray;
    border-radius: 2px;
    overflow: hidden;
}

.header {
    flex: 1;
    z-index: 1;
    padding: 0.5em;
    background: white;
}

.status {
    width: 0.6em;
    background-color: #ff4c4c;

    &.ready {
        background-color: #4CAF50;
    }
}
</style>

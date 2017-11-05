<template>
    <div class="player" :class="{ active: value == id, pressed: isPressed }" v-fastclick="onClick, isPressed">
        <span class="name">{{ player.name }}</span>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: {
        id: Number,
        value: Number,
    },

    data() {
        return {
            isPressed: false,
        };
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

    methods: {
        onClick() {
            this.$emit('input', this.id);
        }
    }
};
</script>

<style scoped lang="less">
@import "~style";

.player {
    display: flex;
    // flex-direction: column;

    margin: 1em 1em 0 1em;
    box-shadow: 0 0 10px gray;
    border-radius: 2px;
    overflow: hidden;

    padding: 0.5em;
    background-color: white;

    &.active {
        box-shadow: 0 0 0 4px #4CAF50;
    }

    &.pressed {
        background-color: lightgray;
    }
}

.status {
    width: 0.6em;
    background-color: #ff4c4c;

    &.ready {
        background-color: #4CAF50;
    }
}
</style>
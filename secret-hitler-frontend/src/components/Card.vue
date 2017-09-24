<template>
    <div class="card" v-fastclick="onClick" :class="{ horizontal }">
        <div class="flipper" :class="{ flipped: value }">
            <div class="front" :style="frontStyle" />
            <div class="back" :style="backStyle" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        card: Object,
        value: Boolean,
        horizontal: { type: Boolean, default: false },
    },

    computed: {
        frontStyle() {
            return {
                backgroundImage: `url(${this.card.front})`,
            };
        },

        backStyle() {
            return {
                backgroundImage: `url(${this.card.back})`,
            };
        }
    },

    methods: {
        onClick() {
            this.$emit('input', !this.value);
        },
    }
};
</script>

<style lang="less" scoped>
.card {
    flex: 1;
    position: relative;
    perspective: 1000px;
    margin-right: 10px;
    -webkit-tap-highlight-color: transparent;

    // &.horizontal {
    //     transform: rotateZ(-90deg);
    //     transform-origin: center;
    // }
}

.flipper {
    transition: 500ms;
    transform-style: preserve-3d;
    position: relative;

    box-sizing: border-box;
    border: 1px solid gray;
    padding-top: 139%;

    transform: rotateY(180deg);
    &.flipped {
        transform: rotateY(0deg);
    }
}

.front,
.back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background-size: 100%;
    background-position: center;
    backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

.front {
    z-index: 2;
    transform: rotateY(0deg);
}

.back {
    transform: rotateY(180deg);
}
</style>

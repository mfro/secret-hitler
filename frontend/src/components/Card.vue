<template>
    <div class="card" @click="$emit('input', !value)">
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
    }
};
</script>

<style lang="less" scoped>
.card {
    flex: 1;
    position: relative;
    perspective: 1000px;
    margin-right: 10px;
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

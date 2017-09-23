<template>
    <div class="card" @click="onClick">
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
    },

    mounted() {
        this.$el.addEventListener('touchstart', this.onTouchStart, { passive: true });
        this.$el.addEventListener('touchend', this.onTouchEnd, { passive: true });
        this.$el.addEventListener('touchcancel', () => this.cancel(), { passive: true });
    },

    methods: {
        onTouchStart(e) {
            this.touchStart = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY,
            };
            this.isPressed = true;
        },

        onTouchEnd(e) {
            if (!this.touchStart) return;

            this.ignore = true;
            this.$emit('input', !this.value);
            this.cancel();
        },

        onClick() {
            if (this.ignore) return this.ignore = false;

            this.$emit('input', !this.value);
        },

        cancel() {
            this.isPressed = false;
            this.touchStart = null;
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
    -webkit-tap-highlight-color: transparent;
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

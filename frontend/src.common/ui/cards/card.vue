<template>
    <div class="card" :style="style" v-resize="resize">
        <div class="rotation" :class="{ horizontal }" :style="rotStyle">
            <div class="flipper" :class="{ flipped: value, border: !noBorder }" @click="onClick">
                <div class="front" :style="frontStyle" />
                <div class="back" :style="backStyle" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        card: Object,
        value: Boolean,
        basis: { type: String, default: 'short' },
        noBorder: { type: Boolean, default: false },
        horizontal: { type: Boolean, default: false },
    },

    data() {
        return {
            style: {
                width: null,
                height: null,
            },
            rotStyle: {
                width: null,
                height: null,
            },
        };
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
        },
    },

    mounted() {
        this.resize();
    },

    methods: {
        resize() {
            this.style.width = this.style.height = null;

            let box = this.$el.getBoundingClientRect();

            let ratio = 256 / 355;

            let width, height;
            if (this.horizontal) {
                if (this.basis == 'long')
                    height = box.width * ratio;

                else
                    width = box.height / ratio;
            } else {
                if (this.basis == 'long')
                    width = box.height * ratio;

                else
                    height = box.width / ratio;
            }

            this.style = {
                width: width ? (Math.floor(width) + 'px') : null,
                height: height ? (Math.floor(height) + 'px') : null,
            };

            if (this.horizontal) {
                this.rotStyle = {
                    width: this.style.height || box.height + 'px',
                    height: this.style.width || box.width + 'px',
                };
            } else {
                this.rotStyle = {
                    width: this.style.width || box.width + 'px',
                    height: this.style.height || box.height + 'px',
                };
            }
        },

        onClick() {
            this.$emit('input', !this.value);
        },
    }
};
</script>

<style module lang="less">
@rounding: 3%;

.card {
    position: relative;

    border-radius: @rounding;
}

.rotation {
    position: absolute;
    width: 100%;
    height: 100%;
    perspective: 600px;

    // transform: translateX(-50%) translateY(-50%);

    &.horizontal {
        transform: rotateZ(-90deg);
        transform-origin: 50% 36.4%;
    }
}

.flipper {
    height: 100%;
    transition: 500ms;
    position: relative;

    border-radius: @rounding;

    transform-style: preserve-3d;
    transform: rotate3d(0, 1, 0, 180deg);

    &.flipped {
        transform: rotate3d(0, 1, 0, 0deg);
    }

    &.border {
        border: 1px solid gray;
    }
}

.front,
.back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    border-radius: @rounding;
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

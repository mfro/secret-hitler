<template>
    <div class="card" :style="style">
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
        noBorder: { type: Boolean, default: false },
        horizontal: { type: Boolean, default: false },
    },

    data() {
        return {
            style: {
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

        rotStyle() {
            if (!this.horizontal)
                return this.style;
                
            return {
                width: this.style.height,
                height: this.style.width,
            };
        }
    },

    mounted() {
        this.resize();
    },

    methods: {
        resize() {
            this.style.width = this.style.height = null;

            setTimeout(() => {
                let box = this.$el.getBoundingClientRect();

                let src = {
                    width: box.width,
                    height: box.height,
                };

                let ratio = 256 / 355;

                let width, height;
                if (this.horizontal) {
                    if (box.width < 10) {
                        width = box.height * ratio;
                        height = box.height;
                    } else {
                        width = box.width;
                        height = box.width * ratio;
                    }
                } else {
                    if (box.width < 10) {
                        width = box.height * ratio;
                        height = box.height;
                    } else {
                        width = box.width;
                        height = box.width / ratio;
                    }
                }

                this.style = {
                    width: Math.floor(width) + 'px',
                    height: Math.floor(height) + 'px',
                };
            }, 1);
        },

        onClick() {
            this.$emit('input', !this.value);
        },
    }
};
</script>

<style lang="less" module>
@rounding: 0.4em;

.card {
    position: relative;

    border-radius: @rounding;
}

.rotation {
    position: absolute;
    top: 50%;
    left: 50%;
    perspective: 600px;

    transform: translateX(-50%) translateY(-50%);

    &.horizontal {
        transform: translateX(-50%) translateY(-50%) rotateZ(-90deg);
        transform-origin: center;
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

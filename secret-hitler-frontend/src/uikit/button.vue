<template>
    <button @click="onClick" :class="clazz">
        <slot/>
    </button>
</template>

<script>
export default {
    data() {
        return {
            isPressed: false,
        };
    },

    computed: {
        clazz() {
            return {
                'active': this.isPressed
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

            e.preventDefault();
            e.stopPropagation();

            this.ignore = true;
            setTimeout(() => this.$emit('click'), 10);
            this.cancel();
        },

        onClick() {
            if (this.ignore) return this.ignore = false;

            setTimeout(() => this.$emit('click'), 10);
        },

        cancel() {
            this.isPressed = false;
            this.touchStart = null;
        }
    }
};
</script>

<style lang="less" scoped>
button {
    padding: 0.5em 2em;
    border-radius: 5px;

    color: #eeeeee;
    border: none;
    background-color: #777777;

    font-size: 16px;
    font-weight: bold;
    font-family: "Graphik", "Helvetica Neue", Helvetica, sans-serif; // box-shadow: 0 0 5px darkgrey;
    
    -webkit-tap-highlight-color: transparent;

    &.active,
    &:active {
        background-color: #616161;
    }
}
</style>

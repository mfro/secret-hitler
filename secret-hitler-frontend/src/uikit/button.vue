<template>
    <button v-fastclick="onClick, isPressed" :class="clazz">
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

    methods: {
        onClick() {
            this.$emit('click');
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

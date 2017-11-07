<template>
    <component :is="component" :args="event.args"/>
</template>

<script>
const regex = /([\w-]+)\/details.vue$/;
const context = require.context('./events', true, /([\w-]+)\/details.vue$/);
const components = {};

for (let key of context.keys()) {
    let match = regex.exec(key);
    let options = context(key);

    components[`event-${match[1]}-details`] = options;
}

export default {
    components: {
        ...components,
    },
    
    props: {
        event: Object,
    },

    computed: {
        component() {
            return `event-${this.event.name}-details`;
        }
    }
};
</script>

<style lang="less" module>
@import "~style";
</style>

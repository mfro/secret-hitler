<template>
    <component :is="component" :args="event.args" @details="$emit('details')"/>
</template>

<script>
const regex = /([\w-]+)\/preview.vue$/;
const context = require.context('./events', true, /([\w-]+)\/preview.vue$/);
const components = {};

for (let key of context.keys()) {
    let match = regex.exec(key);
    let options = context(key);

    components[`event-${match[1]}-preview`] = options;
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
            return `event-${this.event.name}-preview`;
        }
    }
};
</script>

<style lang="less" module>
@import "~style";
</style>

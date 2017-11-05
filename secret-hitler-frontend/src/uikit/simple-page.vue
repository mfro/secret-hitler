<template>
    <div class="simple-page">
        <div class="header" v-if="!noHeader">
            <slot name="header"/>
        </div>

        <div class="contents">
            <slot/>
        </div>
        
        <div class="footer" v-if="!noFooter">
            <slot name="footer"/>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        noHeader: { type: Boolean, default: false, },
        noFooter: { type: Boolean, default: false, },
    },
};
</script>


<style scoped lang="less">
@import "~style";

.simple-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.header {
    .state-header();
}

.contents {
    flex: 1 1;
    overflow: auto;
}

.footer {
    padding: 1em;
}
</style>
<template>
    <div class="container">
        <policy-card class="stack" policy="back" basis="long"/>
        <span>{{ count }}</span>
    </div>
</template>

<script>
import PolicyCard from '@/ui/cards/policy';

export default {
    components: {
        PolicyCard,
    },

    props: {
        count: Number,
    },
};
</script>

<style module lang="less">
@import "~style";

.stack {
    height: 100%;
    box-shadow: 0 0 10px gray;
}

.container {
    position: relative;
    
    span {
        position: absolute;
        bottom: 12%;
        width: 100%;
        text-align: center;

        color: white;
        font-size: 36px;
    }
}
</style>

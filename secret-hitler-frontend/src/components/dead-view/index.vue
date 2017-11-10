<template>
    <uikit:simple-page>
        <span slot="header">You are dead. Sorry :(</span>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            game: 'game',
        }),
    },
};
</script>

<style module lang="less">
@import "~style";

</style>

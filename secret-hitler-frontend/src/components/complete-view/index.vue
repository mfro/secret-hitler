<template>
    <uikit:simple-page>
        <span class="raw">{{ game.victory }}</span>

        <div slot="footer" class="bottom">
            <uikit:button>Ok</uikit:button>
        </div>
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

<style scoped lang="less">
@import "~style";

.header {
    .state-header();
}

.bottom {
    display: flex;
    justify-content: center;
}
</style>

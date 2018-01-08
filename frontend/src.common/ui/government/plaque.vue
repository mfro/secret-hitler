<template>
    <div class="root">
        <div class="image" :class="imageType"/>
    </div>
</template>

<script>
export default {
    props: {
        type: { type: String, default: null },
        president: { type: Boolean, default: false },
        chancellor: { type: Boolean, default: false },
    },

    computed: {
        imageType() {
            if (this.president)
                return 'president';
            if (this.chancellor)
                return 'chancellor';
            return this.type;
        },
    },
};
</script>

<style scoped lang="less">
@import "~style";

.root {
}

.image {
    width: 100%;
    padding-top: 30%;
    background-size: cover;
    background-position: 0 0;

    &.president {
        background-image: url('../../assets/plaque/president.png');
    }

    &.chancellor {
        background-image: url('../../assets/plaque/chancellor.png');
    }
}
</style>
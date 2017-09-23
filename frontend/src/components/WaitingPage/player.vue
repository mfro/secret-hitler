<template>
    <div class="player">
        <div class="status" :class="{ ready: player.isReady }" />
        <div class="header">
            <span>{{ player.name }}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        player: Object,
    },
};
</script>

<style lang="less" scoped>
.player {
    display: flex;
    // flex-direction: column;

    margin: 1em;
    flex: 1 1;
    box-shadow: 0 0 10px gray;
    border-radius: 5px;
    overflow: hidden;
}

.header {
    flex: 1;
    z-index: 1;
    padding: 0.5em;
    background: white;
    // box-shadow: 0 0 10px grey;
}

.status {
    width: 0.6em;
    background-color: #ff4c4c;

    &.ready {
        background-color: #4CAF50;
    }
}
</style>

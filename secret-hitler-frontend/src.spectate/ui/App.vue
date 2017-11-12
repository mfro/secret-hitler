<template>
    <v-app>
        <connect-page v-if="!game"/>

        <completed-view v-else-if="game.state == 'COMPLETED'"/>

        <ingame-view v-else/>
    </v-app>
</template>

<script>
import { mapGetters } from 'vuex';

import ConnectPage from './connect-page';
import CompletedView from './completed-view';
import IngameView from './ingame-view';

export default {
    components: {
        CompletedView,
        ConnectPage,
        IngameView,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            allPlayers: 'allPlayers',
        }),

        isStarted() {
            return this.game != null && this.game.state != 'LOBBY';
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.log-container {
    flex: 0 0 400px;
    background: white;
    overflow: auto;
    box-shadow: 0 0 20px -1px black;

    height: 100vh;
    z-index: 1;
}

.container {
    flex: 0 0 auto;
}

.box {
    margin: 6%;
    background-size: contain;
    background-image: url('@/assets/misc/box.svg');
    background-position: center;
}

.player-name {
    font-size: 24px;
}
</style>

<style lang="less">
html {
    touch-action: manipulation;

    @media screen and (min-width: 600px) {
        overflow-y: auto;
    }
}
</style>

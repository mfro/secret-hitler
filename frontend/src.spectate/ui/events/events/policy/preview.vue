<template>
    <base-event>
        <span slot="icon" class="policy" :class="policy"></span>

        <div class="subtitle">
            <span v-if="args.government">Legislature</span>
            <span v-else>Anarchy</span>
        </div>
    </base-event>
</template>

<script>
import { mapGetters } from 'vuex';

import BaseEvent from '../base';

export default {
    components: {
        BaseEvent,
    },

    props: {
        args: Object,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            getPlayer: 'getPlayer',
            localPlayer: 'localPlayer',
        }),

        policy() {
            return this.args.policy.toLowerCase();
        },
    },
};
</script>

<style module lang="less">
@import "../style";

.policy {
    width: 7rem;
    height: 7rem;
    // background-size: 80%;
    // background-position: center;

    background-color: rgba(0,0,0,0.54);

    -webkit-mask-size: 80%;
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;

    &.liberal {
        // background-image: url('../../../../assets/misc/dove.svg');
        transform: rotateZ(-90deg);

        -webkit-mask-image: url('@/assets/misc/dove.svg');
        background-color: rgba(0, 145, 179, 0.75);
        // color: #00afd8;
    }

    &.fascist {
        // background-image: url('../../../../assets/misc/skull.svg');
        transform: rotateZ(90deg);
        
        -webkit-mask-image: url('@/assets/misc/skull.svg');
        background-color: rgba(214, 13, 0, 0.75);
        // color: rgb(214, 13, 0);
    }
}
</style>

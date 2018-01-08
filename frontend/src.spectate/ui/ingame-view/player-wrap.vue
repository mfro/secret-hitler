<template>
    <div class="root" v-resize="resize">
        <div class="player" :style="style">
            <div class="info">
                <span class="name">{{ player.name }}</span>
            </div>
        </div>

        <div class="anchor" v-resize="resize" :style="style"/>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: {
        player: Object,
    },

    data() {
        return {
            workspace: {
                width: 0,
                height: 0,
            },
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            allPlayers: 'allPlayers',
        }),

        style() {
            let count = 10;
            let offset = 5;

            let angle = Math.PI * 2 / count;

            let ownAngle = angle * 0.5 + (offset + this.player.index) * angle;

            let t1 = this.workspace.width / (2 * Math.cos(ownAngle));
            let t2 = this.workspace.height / (2 * Math.sin(ownAngle));

            if (Math.abs(t1) < Math.abs(t2)) {
                let ratio = 0.5 + t1 * Math.sin(ownAngle) / this.workspace.height;

                if (t1 < 0) {
                    ratio = 1 - ratio;

                    return {
                        left: '0',
                        top: ratio * 100 + 'vh',
                        transform: `translateY(${(-ratio) * 100}%)`
                    };
                } else {
                    return {
                        right: '0',
                        top: ratio * 100 + 'vh',
                        transform: `translateY(${(-ratio) * 100}%)`
                    };
                }
            } else {
                let ratio = 0.5 + t2 * Math.cos(ownAngle) / this.workspace.width;

                if (t2 < 0) {
                    ratio = 1 - ratio;
                    
                    return {
                        top: '0',
                        left: ratio * 100 + 'vw',
                        transform: `translateX(${(ratio - 1) * 100}%)`
                    };
                } else {
                    return {
                        bottom: '0',
                        left: ratio * 100 + 'vw',
                        transform: `translateX(${(ratio - 1) * 100}%)`
                    };
                }
            }

            // let t = Math.min(t1, t2);

            // let x = this.workspace.width / 2 + t * Math.cos(ownAngle);
            // let y = this.workspace.height / 2 + t * Math.sin(ownAngle);

            // return {
            //     top: y + 'px',
            //     left: x + 'px',
            // };
        }
    },

    created() {
        this.resize();
    },

    methods: {
        resize() {
            this.workspace = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
    }
};
</script>

<style module lang="less">
@import "~style";

.player {
    position: absolute;
    min-width: 200px;

    background-color: white;
    border: 1px solid gray;
}

.info {
    color: inherit;
}

.name {
    color: inherit;
    font-size: 24px;
}

.anchor {
    position: absolute;
    transform: translate(-50%, -50%) !important;
    width: 10px;
    height: 10px;
    background-color: red;
}
</style>

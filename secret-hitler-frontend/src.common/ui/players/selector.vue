<template>
    <v-dialog scrollable fullscreen v-model="isOpen" transition="dialog-bottom-transition">
        <v-list slot="activator">
            <v-list-tile>
                <v-list-tile-action>
                    <v-icon medium v-if="value">person</v-icon>
                    <v-icon medium v-else>person_outline</v-icon>
                </v-list-tile-action>

                <v-list-tile-title>
                    <span class="player-name" v-if="value">{{ value.name }}</span>
                    <span v-else>Select a player</span>
                </v-list-tile-title>
            </v-list-tile>
        </v-list>

        <v-card>
            <v-toolbar>
                <v-toolbar-side-icon @click="isOpen = false">
                        <v-icon>close</v-icon>
                </v-toolbar-side-icon>
                <v-toolbar-title>Select a player</v-toolbar-title>
            </v-toolbar>
            <v-card-text class="dialog-contents">
                <v-list>
                    <v-list-tile v-for="player in options" :key="player.id" @click="select(player)">
                        <v-list-tile-title>
                            <span class="player-name">{{ player.name }}</span>
                        </v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: {
        value: Object,
        filter: { type: Function, required: false },
    },

    data() {
        return {
            isOpen: false,
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            allPlayers: 'allPlayers',
            localPlayer: 'localPlayer',
        }),

        options() {
            let list = this.allPlayers.filter(p => {
                if (p.isAlive === false)
                    return false;

                return !this.filter || this.filter(p)
            });

            return list;
        },
    },

    methods: {
        select(player) {
            this.isOpen = false;
            this.$emit('input', player);
        }
    }
};
</script>

<style module lang="less">
@import "~style";

.dialog-contents {
    padding: 0;
}

.player {
    flex-basis: 34%;

    box-shadow: 0 0 10px gray;

    border-radius: 3px;
    margin: @spacer (@spacer * 0.5) 0;

    &.active {
        box-shadow: 0 0 10px gray,
                    0 0 0px 4px #4CAF50;
    }
}
</style>

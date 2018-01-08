<template>
    <v-app>
        <v-toolbar app fixed dark class="accent">
            <v-toolbar-side-icon v-if="backDst" @click="back()">
                <v-icon>arrow_back</v-icon>
            </v-toolbar-side-icon>
            <v-toolbar-side-icon v-else-if="isStarted" @click="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title class="header">Secret Hitler</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>

        <v-navigation-drawer app temporary v-model="drawer" class="pb-0">
            <v-layout column fill-height>
                <v-layout row v-if="isStarted" class="scores">
                    <v-layout column my-3 ml-3 class="score">
                        <policy-card policy="LIBERAL"/>
                        <span class="title pa-3">{{ game.boardState.liberals }}</span>
                    </v-layout>

                    <v-layout column ma-3 class="score">
                        <policy-card policy="FASCIST"/>
                        <span class="title pa-3">{{ game.boardState.fascists }}</span>
                    </v-layout>
                </v-layout>

                <v-layout v-if="isStarted" class="election-tracker pb-2">
                    <v-layout align-center justify-center v-for="n in 3" :key="n">
                        <v-icon v-if="game.boardState.voteFailures == n - 1">radio_button_checked</v-icon>
                        <v-icon v-else>radio_button_unchecked</v-icon>
                    </v-layout>

                    <v-layout align-center justify-center>
                        <v-icon>error_outline</v-icon>
                    </v-layout>
                </v-layout>

                <v-list>
                    <v-divider/>

                    <v-list-tile v-for="arg in navs" :key="arg.path" :to="(arg.path)">
                        <v-list-tile-action>
                            <v-icon v-text="arg.icon"/>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ arg.label }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile v-if="game">
                        <v-list-tile-action>
                            <v-icon>videogame_asset</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Game code: {{ game.name }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-layout>
        </v-navigation-drawer>

        <main>
            <v-content class="content">
                <router-view/>
            </v-content>
        </main>
    </v-app>
</template>

<script>
import { mapGetters } from 'vuex';

import * as socket from '@/socket';

import PolicyCard from '@/ui/cards/policy';

export default {
    name: 'SecretHitler',

    components: {
        PolicyCard,
    },

    data() {
        return {
            drawer: false,
            navs: [
                { icon: 'home', label: 'Home', path: '/home', },
                { icon: 'person', label: 'Role', path: '/role', },
                { icon: 'history', label: 'Game log', path: '/log', },
                { icon: 'settings', label: 'Game options', path: '/options', },
            ]
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            results: 'results',
            localPlayer: 'localPlayer',

            route: 'router/route',
        }),

        isStarted() {
            return this.game != null && this.game.state != 'LOBBY';
        },

        backDst() {
            return this.$route.meta.back;
        },
    },

    watch: {
        isStarted() {
            try {
                localStorage.setItem('secret-hitler/rejoin-info', JSON.stringify([this.game.name, this.localPlayer.id]));
            } catch (e) { }
        }
    },

    methods: {
        back() {
            this.$router.push(this.backDst);
        },
    }
};
</script>

<style module lang="less">
@import "~style";

.content {
    background-color: white;
}

.scores {
    flex: 0 0 auto;
}

.election-tracker {
    flex: 0 0 auto;
}

.score {
    flex-basis: 0;

    span {
        align-self: center;
    }
}

.raw {
    white-space: pre;
    font-family: monospace;
}
</style>

<style lang="less">
html {
    touch-action: manipulation;

    @media screen and (min-width: 600px) {
        overflow-y: auto;
    }
}

a {
    text-decoration: none;
}

.application {
    min-height: 100%;
}
</style>

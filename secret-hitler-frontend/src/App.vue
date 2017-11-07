<template>
    <v-app>
        <v-toolbar app fixed dark class="accent">
            <v-toolbar-side-icon v-if="isStarted" @click="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title>Secret Hitler</v-toolbar-title>
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

                    <v-list-tile v-for="arg in navs" :key="arg.id" @click="nav(arg.id)" :class="{ navActive: force == arg.id }">
                        <v-list-tile-action>
                            <v-icon v-text="arg.icon"/>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title v-text="arg.label"/>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-layout>
        </v-navigation-drawer>

        <main>
            <v-content class="content">
                <log-view v-if="force == 'log'"/>

                <assignment-view v-else-if="force == 'role'"/>

                <result-view :result="result" v-else-if="result"/>

                <component :is="`${page}-view`" v-else-if="page"/>

                <span class="raw" v-else>{{ game }}</span>
            </v-content>
        </main>
    </v-app>
</template>

<script>
import { mapGetters } from 'vuex';

import * as socket from '@/socket';

import LobbyView from '@/components/lobby-view';
import NominatingView from '@/components/nominating-view';
import LegislatingView from '@/components/legistlating-view';
import VotingView from '@/components/voting-view';
import LoginView from '@/components/login-view';
import ExecutiveActionView from '@/components/executive_action-view';
import CompletedView from '@/components/completed-view';

import ResultView from '@/components/result-view';

import LogView from '@/components/log-view';
import AssignmentView from '@/components/assignment-view';

import PolicyCard from '@/ui/policy-card';

export default {
    name: 'SecretHitler',

    components: {
        LobbyView,
        NominatingView,
        LegislatingView,
        VotingView,
        LoginView,
        ResultView,
        ExecutiveActionView,
        CompletedView,
        PolicyCard,
        LogView,
        AssignmentView,
    },

    data() {
        return {
            drawer: false,
            force: 'home',
            navs: [
                { icon: 'home', label: 'Home', id: 'home', },
                { icon: 'person', label: 'Role', id: 'role', },
                { icon: 'history', label: 'Game log', id: 'log', },
            ]
        };
    },

    computed: {
        ...mapGetters({
            game: 'game',
            results: 'results',
            localPlayer: 'localPlayer',
        }),

        raw() {
            return JSON.stringify(this.game, null, 4);
        },

        page() {
            if (!this.game)
                return 'login';

            if (this.game.state == 'EXECUTIVE_ACTION')
                return 'executive-action';

            return this.game.state.toLowerCase();
        },

        isStarted() {
            return this.game != null && this.game.state != 'LOBBY';
        },

        result() {
            return this.results[0];
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
        nav(page) {
            this.force = page;
            this.drawer = false;
        }
    }
};
</script>

<style module lang="less">
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

.navActive {
    background: #eeeeee;   
}

.raw {
    white-space: pre;
    font-family: monospace;
}
</style>

<style lang="less">
html {
    touch-action: manipulation;
}
</style>

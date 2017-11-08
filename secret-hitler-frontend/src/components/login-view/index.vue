<template>
    <v-layout column align-center>
        <div class="logo" />

        <v-container>
            <v-text-field v-model="gameCode" label="Game code" type="number"/>
            <v-text-field v-model="name" label="Name"/>
            
            <v-layout justify-space-around mt-3>
                <template v-if="!connection">
                    <v-btn @click="create()">Create</v-btn>
                    <v-btn @click="watch()">Watch</v-btn>
                    <v-btn @click="join()">Join</v-btn>
                </template>

                <v-progress-circular indeterminate v-else-if="connection == 'CONNECTING'"/>

                <span class="raw" v-else>{{ connection }}</span>
            </v-layout>
        </v-container>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import * as socket from '@/socket';

export default {
    data() {
        return {
            name: '',
            gameCode: '',
        };
    },

    computed: {
        ...mapGetters({
            connection: 'connection'
        }),
    },

    created() {
        try {
            this.name = localStorage.getItem('secret-hitler/name') || '';
        } catch (e) { }
    },

    methods: {
        onKeyDown(e) {
            if (e.keyCode == 13)
                this.start();
        },

        create() {
            try {
                localStorage.setItem('secret-hitler/name', this.name);
            } catch (e) { }

            socket.create(this.name);
        },

        watch() {
            socket.watch(this.gameCode);
        },

        join() {
            try {
                localStorage.setItem('secret-hitler/name', this.name);
            } catch (e) { }

            socket.join(this.gameCode, this.name);
        },
    }
};
</script>

<style lang="less" module>
.login-page {
    display: flex;
    align-items: center;
    flex-direction: column;
}

.logo {
    background-image: url('../../assets/logo.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    width: 70%;
    max-width: 25em;
    height: 30vh;
    
    filter: drop-shadow(0 0 10px gray);
}

.raw {
    font-family: monospace;
    white-space: pre;
}
</style>

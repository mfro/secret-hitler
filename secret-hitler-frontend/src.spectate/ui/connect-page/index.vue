<template>
    <v-dialog persistent :transition="false" :value="true" max-width="360">
        <v-card>
            <v-card-title primary-title>
                <span class="headline ">Spectate game</span>
            </v-card-title>
            <v-card-text>
                <v-text-field v-model="gameCode" type="number" label="Game code"/>
            </v-card-text>
            <v-card-actions>
                <v-layout justify-end>
                    <v-btn flat @click="connect()">Spectate</v-btn>
                </v-layout>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import * as socket from '@/socket';

export default {
    data() {
        return {
            gameCode: ''
        };
    },

    methods: {
        connect() {
            socket.watch(this.gameCode);
        }
    }
};
</script>

<style module lang="less">

</style>

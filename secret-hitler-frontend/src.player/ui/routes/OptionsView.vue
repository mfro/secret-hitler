<template>
    <div class="root">
        <v-layout justify-center py-3>
            <v-btn @click="abandon()">Abandon Game</v-btn>
        </v-layout>
    </div>
</template>

<script>
import * as socket from '@/socket';

export default {
    methods: {
        abandon() {
            socket.reset();
            this.$router.push('/');
        },
    },
};
</script>

<style module lang="less">
@import "~style";

.root {
    
}
</style>
<template>
    <div class="login-page">
        <div class="logo" />

        <div class="form">
            <span>Please enter your name:</span>
            <input type="text" v-model="name" @keydown="onKeyDown"/>
            <uikit:button @click="start()">Submit</uikit:button>
        </div>
    </div>
</template>

<script>
import * as socket from '@/socket';

export default {
    data() {
        return {
            name: ''
        };
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
        
        start() {
            try {
                localStorage.setItem('secret-hitler/name', this.name);
            } catch (e) { }

            socket.join(this.name);
        }
    }
};
</script>

<style lang="less" scoped>
.login-page {
    display: flex;
    align-items: center;
    flex-direction: column;

    padding: 10px 20px;
}

.logo {
    background-image: url('../../assets/logo.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    width: 80%;
    height: 30vh;
}

.form {
    display: flex;
    align-items: center;
    flex-direction: column;

    padding: 1.5em;
    border-radius: 2px; // background-color: #F7E1C3;
    background-color: #413b32;
    border: 5px solid #F7E1C3;
    color: #F7E1C3;

    font-family: "courier-prime", Courier, sans-serif;
}

h2 {
    font-size: 18px;
    display: block;
    margin: 0 0 1em 0;
    font-weight: bold;
}

input {
    margin: 1.5em 0;
    width: 100%;
    font-size: 1em;

    border: 1px solid #F7E1C3;
    border-radius: 2px;
    padding: 4px 4px 2px 4px;
    background-color: #f7e1c3;
    font-family: inherit;
    font-size: 18px;
    font-weight: 600;
    color: #413b32;
    outline: none;
    -webkit-appearance: none;
}
</style>

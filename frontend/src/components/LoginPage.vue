<template>
    <div class="login-page">
        <h2>Welcome to Secret Hitler</h2>
        <span>Please enter your name:</span>
        <input type="text" v-model="name" />
        <button @click="start()">Submit</button>
    </div>
</template>

<script>
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
        start() {
            try {
                localStorage.setItem('secret-hitler/name', this.name);
            } catch (e) { }

            this.$store.commit('setSelf', {
                name: this.name
            });
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

h2 {
    display: block;
    font-size: 1.5em;
    margin: 0 0 1em 0;
    font-weight: bold;
}

input {
    margin: 1em 0;
    width: 50%;
    font-size: 1em;
}

button {
    padding: 0.3em 1em;
}
</style>

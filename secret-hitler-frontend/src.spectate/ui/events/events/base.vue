<template>
    <v-layout column class="root">
        <div>
            <v-layout align-center justify-center class="icon-container">
                <slot name="icon"/>
            </v-layout>
        </div>

        <v-spacer/>

        <slot/>

        <v-spacer/>
    </v-layout>
</template>

<style module lang="less">
@import "~style";

.root {
    height: 20vh;
    flex: 0 0 20vh;
    padding: @spacer;
}

.icon-container :global(.icon) {
    font-size: 7rem;
}
</style>

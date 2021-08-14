<template>
    <div v-if="loaded">
        <Header></Header>
        <router-view />
        <div v-if="!online" class="absolute bottom-0 w-full">
            <div class="container mx-auto items-center">
                <div class="flex flex-col">
                    <div class="bg-red-200 rounded mx-5 py-3 px-5">
                        <h1 class="text-lg font-bold">No internet. Any changes you make will not be saved.</h1>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Header from "./components/Header.vue";

export default {
    data() {
        return {
            loaded: false,
            online: navigator.onLine
        };
    },

    components: {
        Header: Header
    },

    beforeCreate() {
        window.addEventListener('online', () => {
            console.log('Application came online');
            this.online = navigator.onLine;
        });

        window.addEventListener('offline', () => {
            console.log('Application went offline');
            this.online = navigator.onLine;
        });

        this.$store.dispatch("auth/load").then(() => {
            this.loaded = true;
        });
    },
};
</script>

<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
</style>

<template>
    <section class="text-gray-400 bg-gray-900 body-font relative">
        <div class="container px-5 py-24 mx-auto">
            <div class="flex flex-col text-center w-full mb-12">
                <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-white">Login</h1>
                <p class="lg:w-2/3 mx-auto leading-relaxed text-base">Please sign in with your account credentials below</p>
            </div>
            <div class="lg:w-1/2 md:w-2/3 mx-auto">
                <div class="flex flex-wrap -m-2">
                    <div class="p-2 w-full">
                        <div class="relative">
                            <label for="name" class="leading-7 text-sm text-gray-400">Email</label>
                            <my-input type="email" v-model="email"></my-input>
                        </div>
                    </div>
                    <div class="p-2 w-full">
                        <div class="relative">
                            <label for="email" class="leading-7 text-sm text-gray-400">Password</label>
                            <my-input type="password" v-model="password"></my-input>
                        </div>
                    </div>
                    <div class="p-2 w-full">
                        <div class="w-full sm:w-2/3 md:w-1/3 lg:w-1/4 xl:w-1/5 mx-auto">
                            <div class="relative">
                                <label for="email" class="leading-7 text-sm text-gray-400">Remember me?</label>
                                <my-input type="checkbox" v-model="remember"></my-input>
                            </div>
                        </div>
                    </div>
                    <div class="p-2 w-full">
                        <button @click.stop.prevent="login" class="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Login</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    data() {
        return {
            'message': null,
            'email': '',
            'password': '',
            'remember': false
        }
    },

    methods: {
        login() {
            this.$store.dispatch('auth/auth', {email: this.email, password: this.password, remember: this.remember}).then(response => {
                if (response.data.success) {
                    this.$router.push('/');
                } else {
                    this.message = response.data.message;
                }
            }).catch(error => {
                if (error.response != null && error.response.data != null && error.response.data.message != null)
                    this.message = error.response.data.message;
                else
                    console.error(error);
            })
        }
    },

    created() {
        if (this.$store.getters['auth/loggedIn']) {
            this.$router.push('/');
        }
    }
}
</script>
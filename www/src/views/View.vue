<template>
    <section class="text-gray-400 bg-gray-900 body-font" v-if="pakbon">
        <div class="container mx-auto flex px-0 sm:px-5 py-12 md:flex-row flex-col items-center">
            <div class="flex flex-col mx-auto">
                <div class="-my-2 overflow-x-auto sm:-mx-2 lg:-mx-4">
                    <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg bg-white">
                            <h1 class="text-gray-600 font-bold">{{ pakbon.id }} ({{ pakbon.order_number }}) - {{ date }}</h1>
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Price
                                        </th>
                                        <th scope="col" class="relative px-2 py-3">
                                            <span class="sr-only">Confirm</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="product in pakbon.products" :key="pakbon.id + '-' + product.name + product.id + '-' + product.checked">
                                        <td class="px-2 py-3 whitespace-normal md:whitespace-nowrap">
                                            <p class="m-0 p-0 text-sm text-center md:text-left font-medium text-gray-900">
                                                {{ product.name }} 
                                                {{ product.status === 'FREE' ? '(FREE)': '' }}
                                                {{ product.status === 'OUT_OF_STOCK' ? '(OUT OF STOCK)': '' }}
                                            </p>
                                        </td>
                                        <td class="px-2 py-3 whitespace-normal md:whitespace-nowrap">
                                            <div class="text-sm text-gray-900">
                                                {{ product.amount }}
                                            </div>
                                        </td>
                                        <td class="px-2 py-3 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">
                                                &euro; {{ (Math.round(product.price * 100) / 100).toFixed(2) }}
                                            </div>
                                        </td>
                                        <td class="px-2 py-3 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">
                                                &euro; {{ (Math.round(product.total_price * 100) / 100).toFixed(2) }}
                                            </div>
                                        </td>
                                        <td class="px-2 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <span class="border rounded-full border-grey-100 flex items-center cursor-pointer w-12 bg-green-600 justify-end" v-if="product.checked" @click.stop.prevent="toggle(product)" :key="product.id + 'on'">
                                                <span class="rounded-full border w-6 h-6 border-grey-100 bg-white"></span>
                                            </span>
                                            <span class="border rounded-full border-grey-100 flex items-center cursor-pointer w-12 justify-start" v-else @click.stop.prevent="toggle(product)" :key="product.id + 'off'">
                                                <span class="rounded-full border w-6 h-6 border-grey-100 bg-white"></span>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import axios from "axios";
import moment from "moment";

const getData = id => {
    return axios.get(`/api/v1/fetch/${id}`);
};

export default {
    name: "view",

    data() {
        return {
            intervalId: null,
            pakbon: null
        };
    },

    beforeUnmount() {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
        }
    },

    methods: {
        startRefresher() {
            if (this.intervalId != null) {
                clearInterval(this.intervalId);
            }
            
            this.intervalId = setInterval(() => {
                this.fetchData();
            }, 2500); // 2500 milliseconds = 2.5 seconds
        },
        fetchData() {
            if (this.intervalId != null) {
                clearInterval(this.intervalId);
            }

            getData(this.$route.params.id)
                .then(response => {
                    this.pakbon = response.data.data;
                    this.startRefresher();
                })
                .catch(err => {
                    console.error(err);
                    this.pakbon = null;
                });
        },
        toggle(product) {
            product.checked = !product.checked;

            clearInterval(this.intervalId);
            axios.post(`/api/v1/toggle/${this.pakbon.id}/${product.id}`, {
                checked: product.checked ? 'yes' : 'no'
            }).then(response => {
                this.pakbon = response.data.data;
                this.startRefresher();
            }).catch(err => {
                console.error(err);
            });
        }
    },

    computed: {
        date: {
            get() {
                if (this.pakbon == null) return "";
                return moment.unix(this.pakbon.date).format("Y-MM-DD HH:mm:ss");
            }
        }
    },

    beforeRouteEnter(to, from, next) {
        // called before the route that renders this component is confirmed.
        // does NOT have access to `this` component instance,
        // because it has not been created yet when this guard is called!
        next(vm => {
            vm.fetchData();
        });
    },
    beforeRouteUpdate(to, from, next) {
        // called when the route that renders this component has changed.
        // This component being reused (by using an explicit `key`) in the new route or not doesn't change anything.
        // For example, for a route with dynamic params `/foo/:id`, when we
        // navigate between `/foo/1` and `/foo/2`, the same `Foo` component instance
        // will be reused (unless you provided a `key` to `<router-view>`), and this hook will be called when that happens.
        // has access to `this` component instance.
        this.fetchData();
    }  
};
</script>
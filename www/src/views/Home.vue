<template>
    <section class="text-gray-400 bg-gray-900 body-font">
        <div
            class="container mx-auto flex px-5 py-4 md:py-24 md:flex-row flex-col items-center"
        >
            <div
                class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left items-center text-center"
            >
                <h1
                    class="title-font sm:text-4xl text-3xl mb-4 font-medium text-white"
                >
                    AH Pakbon Parser
                </h1>
                <p class="mb-8 leading-relaxed">
                    The AH pakbon is no longer delivered to you on paper. This
                    website can automatically parse the email from AH to turn it
                    into an interactive checklist.
                </p>
            </div>
            <!-- <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
                <img
                    class="object-cover object-center rounded"
                    alt="hero"
                    src="https://dummyimage.com/720x600"
                />
            </div> -->
        </div>
        <div class="container mx-auto flex px-5 md:flex-row flex-col items-center">
            <div class="w-full flex flex-col md:items-start md:text-left mb-4 items-center text-center">
                <h1 class="title-font sm:text-4xl text-3xl font-medium text-white">
                    Overview
                </h1>
            </div>
        </div>
        <div class="container mx-auto flex px-5 md:flex-row flex-col items-center" v-if="itemsParsed != null">
            <my-table
                dusk="crud-list"
                :delete-warning="'Are you sure you want to delete this?'"
                :update-route="'/open/X_ID_X'"
                :delete-route="''"
                :search-placeholder="'Search AH Pakbon'"
                :raw-data="itemsParsed"
                :columns="columns"
                :can-delete="false"
                :can-update="true"
            >
            </my-table>
        </div>
    </section>
</template>

<script>
import axios from "axios";
import moment from 'moment';
const getData = () => {
    return axios.get("/api/v1/fetch");
};

export default {
    name: "home",
    data() {
        return {
            items: null,
            columns: [
                {
                    data: "date",
                    title: "Date"
                },
                {
                    data: "order_number",
                    title: "Order Number"
                }
            ]
        };
    },

    computed: {
        itemsParsed: {
            get() {
                if (this.items == null) return null;

                console.log('moment', moment.unix(1706387157).format('Y-MM-DD HH:mm:ss'));

                return this.items.map(item => {
                    return {
                        ...item,
                        date: moment.unix(item.date).format('Y-MM-DD HH:mm:ss')
                    };
                });
            }
        }
    },

    beforeRouteEnter(_to, _from, next) {
        // called before the route that renders this component is confirmed.
        // does NOT have access to `this` component instance,
        // because it has not been created yet when this guard is called!
        next(vm => {
            getData()
                .then(response => {
                    vm.items = response.data.data;
                })
                .catch(err => {
                    console.error(err);
                    vm.items = [];
                });
        });
    },
    beforeRouteUpdate(_to, _from, next) {
        // called when the route that renders this component has changed.
        // This component being reused (by using an explicit `key`) in the new route or not doesn't change anything.
        // For example, for a route with dynamic params `/foo/:id`, when we
        // navigate between `/foo/1` and `/foo/2`, the same `Foo` component instance
        // will be reused (unless you provided a `key` to `<router-view>`), and this hook will be called when that happens.
        // has access to `this` component instance.
        getData()
            .then(response => {
                this.items = response.data.data;
                next();
            })
            .catch(err => {
                console.err(err);
                this.items = [];
            });
    }
};
</script>

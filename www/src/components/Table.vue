<template>

    <div class="flex flex-col w-full">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <!-- <input class="inline w-full" type="text" v-model="filter" :placeholder="searchPlaceholder"> -->
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    v-for="column in columns" @click="setSortBy(column.data)" :key="column + getSortByIcon(column.data)">
                                    {{ column.title }} <i class="fas" :class="getSortByIcon(column.data)"></i>
                                </th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="row in displayed" :key="'crud-list-id-' + row.id">
                                <td class="px-2 py-3 whitespace-normal md:whitespace-nowrap" v-for="column in columns" :key="'crud-list-id-' + row.id + '-column-' + column.data">
                                    <div class="text-sm text-gray-900">
                                        {{ row[column.data] }}
                                    </div>
                                </td>
                                <td class="px-2 py-3 whitespace-nowrap text-right text-sm font-medium">
                                    <router-link v-if="canUpdate" role="button" :to="{path: updateRoute.replace('X_ID_X', row.id)}" class="bg-blue-500 hover:bg-blue-600 p-2 text-white hover:shadow-lg w-1/2">
                                        <i class="fas fa-edit"></i>
                                    </router-link>
                                    <a v-if="canDelete" role="button" @click.prevent="deleteItem(row.id)" href="#" class="bg-red-500 hover:bg-red-600 p-2 text-white hover:shadow-lg w-1/2">
                                        <i class="fas fa-trash"></i>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    name: "my-table",

    props: ['deleteWarning', 'updateRoute', 'deleteRoute', 'searchPlaceholder', 'rawData', 'columns', 'canDelete', 'canUpdate'],

    data() {
        return {
            sort: {
                column: this.columns[0].data,
                direction: 'DESC'
            },
            data: this.rawData,
            filter: '',
            loading: false,
        }
    },

    methods: {
        setSortBy(column) {
            if (this.sort.column === column)
                this.sort.direction = this.sort.direction === 'ASC' ? 'DESC' : 'ASC';
            else {
                this.sort.column = column
                this.sort.direction = 'ASC';
            }
        },
        getSortByIcon(column) {
            if (column === this.sort.column) {
                return this.sort.direction === 'ASC' ? 'fa-sort-up' : 'fa-sort-down';
            }

            return 'fa-sort';
        },
        deleteItem(id) {
            if (confirm(this.deleteWarning)) {
                this.loading = true;
                axios.post(this.deleteRoute.replace('X_ID_X', id), {
                    '_method': 'DELETE'
                }).then(_response => {
                    this.data.splice(this.data.findIndex(i => i.id === id), 1);
                    this.loading = false;
                }).catch(_ignore => {
                    this.loading = false;
                });
            }
        }
    },

    computed: {
        displayed: {
            get() {
                let filtered = this.data.filter(i => {
                    return Object.values(i).join(' ').toUpperCase().indexOf(this.filter.toUpperCase()) > -1;
                })

                if (this.sort.direction === 'ASC') {
                    return filtered.sort((a, b) => {
                        let aValue = a[this.sort.column];
                        let bValue = b[this.sort.column];
                        if (aValue === bValue)
                            return 0;

                        return aValue > bValue ? 1 : -1
                    });
                } else {
                    return filtered.sort((a, b) => {
                        let aValue = a[this.sort.column];
                        let bValue = b[this.sort.column];
                        if (aValue === bValue)
                            return 0;

                        return aValue > bValue ? -1 : 1
                    });
                }
            }
        }
    }
}
</script>

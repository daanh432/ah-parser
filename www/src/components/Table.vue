<template>
    <div class="w-full">
        <input class="inline w-full" type="text" v-model="filter" :placeholder="searchPlaceholder">
        <table class="table w-full p-2">
            <thead>
            <tr class="bg-gray-50 border-b">
                <th class="border-l border-r p-2 cursor-pointer" v-for="column in columns" @click="setSortBy(column.data)" :key="column + getSortByIcon(column.data)">
                    {{ column.title }}
                    <i class="fas" :class="getSortByIcon(column.data)"></i>
                </th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            <tr class="bg-gray-50 text-center border-b" v-for="row in displayed" :key="'crud-list-id-' + row.id">
                <td class="p-2 border-l border-r" v-for="column in columns" :key="'crud-list-id-' + row.id + '-column-' + column.data">{{ row[column.data] }}</td>
                <td class="w-1/12">
                    <div class="flex justify-center">
                        <a v-if="canUpdate" role="button" :href="updateRoute.replace('X_ID_X', row.id)" class="bg-blue-500 hover:bg-blue-600 p-2 text-white hover:shadow-lg w-1/2"><i class="fas fa-edit"></i></a>
                        <a v-if="canDelete" role="button" @click.prevent="deleteItem(row.id)" href="#" class="bg-red-500 hover:bg-red-600 p-2 text-white hover:shadow-lg w-1/2"><i class="fas fa-trash"></i></a>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>
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
                direction: 'ASC'
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

<template>
    <div>
        <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <li>
                    <router-link to="/">Home</router-link>
                </li>
                <li class="is-active">
                    <router-link to="/series" aria-current="page">Series</router-link>
                </li>
            </ul>
        </nav>
        <div class="box">
            <form @submit.prevent="addSeries">
                <div class="field">
                    <label class="label">Name</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="Percy Jackson and the Olympians" v-model="seriesName" required>
                    </div>
                </div>
                <div class="control">
                    <button class="button is-link">Add</button>
                </div>
            </form>
        </div>
        <div class="box" v-if="series.length > 0">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Added On</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(series, index) in series">
                        <td>{{ series.name }}</td>
                        <td>{{ series.created_at | localizeDateTime }}</td>
                        <td><button class="button" @click="editSeries(series.id, series.name)">Edit</button></td>
                        <td><button class="button is-danger is-outlined" @click="deleteSeries(series.id, index)">Delete</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="box" v-else>
            No series have been added so far
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            seriesName: '',
            series: []
        }
    },
    created() {
        this.fetchSeries()
    },
    methods: {
        fetchSeries() {
            (async () => {
                const rawResponse = await fetch('/series/all', { credentials: 'include', headers: this.$store.state.fetchHeaders })
                const response = await rawResponse.json()
                this.series = response
            })()
        },
        addSeries() {
            (async () => {
                const rawResponse = await fetch('/series/add', {
                    credentials: 'include',
                    method: 'POST',
                    headers: this.$store.state.fetchHeaders,
                    body: JSON.stringify({ name: this.seriesName })
                })
                const response = await rawResponse.json()

                if(response.success) {
                    this.seriesName = ''
                    this.fetchSeries()
                } else {
                    console.log(response.error)
                }
            })()
        },
        editSeries(id, oldName) {
            this.alertify.defaultValue(oldName)
                    .prompt("Rename", newName => {
                        (async () => {
                            const rawResponse = await fetch(`/series/${id}`, {
                                credentials: 'include',
                                method: 'PATCH',
                                headers: this.$store.state.fetchHeaders,
                                body: JSON.stringify({ name: newName })
                            })
                            const response = await rawResponse.json()

                            if(response.success) {
                                this.series.some(series => {
                                    if(series.id === id) {
                                        series.name = newName
                                        return true
                                    }
                                })
                            } else {
                                console.log(response.error)
                            }
                        })()
                    })
        },
        deleteSeries(id, index) {
            if(confirm('Are you sure? Deleting a series will delete all the books attached to it!')) {
                (async () => {
                    const rawResponse = await fetch(`/series/${id}`, {
                        credentials: 'include',
                        headers: this.$store.state.fetchHeaders,
                        method: 'DELETE'
                    })
                    const response = await rawResponse.json()

                    if(response.success) {
                        this.series.splice(index, 1)
                    } else {
                        console.log(response.error)
                    }
                })()
            }
        }
    }
}
</script>
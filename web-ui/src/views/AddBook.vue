<template>
    <div>
        <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <li>
                    <router-link to="/">Home</router-link>
                </li>
                <li>
                    <router-link to="/books">Books</router-link>
                </li>
                <li class="is-active">
                    <router-link to="/books/add" aria-current="page">Add Book</router-link>
                </li>
            </ul>
        </nav>
        <div class="box">
            <form @submit.prevent="addBook">
                <div class="field">
                    <label class="label">Name</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="Percy Jackson and the Lightning Thief" v-model="book.name" required v-focus>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Author</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="Rick Riordan" v-model="book.author" required>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Cover image</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="http://link-to-image/img.jpg" v-model="book.cover_image">
                    </div>
                </div>
                <div class="field">
                    <label class="label">Type</label>
                    <div class="select">
                        <select v-model="book.type">
                            <option v-for="bookType in staticData.bookTypes">{{ bookType }}</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Version</label>
                    <v-select taggable :options="staticData.bookVersions" v-model="book.version"></v-select>
                </div>
                <div class="field">
                    <label class="label">Is part of a series?</label>
                    <div class="control">
                        <label class="radio">
                            <input type="radio" value="1" v-model="book.is_series">
                            Yes
                        </label>
                        <label class="radio">
                            <input type="radio" value="0" v-model="book.is_series">
                            No
                        </label>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Pick a series from the list</label>
                    <div class="select">
                        <select v-model="book.series_id">
                            <option value="">--- SELECT ---</option>
                            <option v-for="series in series" :value="series.id">{{ series.name }}</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Series index</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="6" v-model="book.series_index">
                    </div>
                </div>
                <div class="field">
                    <label class="label">Status</label>
                    <div class="select">
                        <select v-model="book.status">
                            <option v-for="bookStatus in staticData.bookStatuses">{{ bookStatus }}</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Started Reading</label>
                    <div class="control">
                        <input class="input" type="Date" v-model="book.started_reading">
                    </div>
                </div>
                <div class="field">
                    <label class="label">Completed Reading</label>
                    <div class="control">
                        <input class="input" type="Date" v-model="book.completed_reading">
                    </div>
                </div>
                <div class="field">
                    <label class="label">Extra Info</label>
                    <div class="control">
                        <textarea class="textarea" v-model="book.extra_metadata"></textarea>
                    </div>
                </div>
                <div class="control">
                    <button class="button is-link">Add</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import staticData from './../static_data'

export default {
    data() {
        return {
            book: {
                name: '',
                author: '',
                cover_image: '',
                type: 'Novel',
                version: '',
                is_series: '0',
                series_id: '',
                series_index: '',
                status: 'Currently Reading',
                started_reading: new Date().toISOString().split('T')[0],
                completed_reading: '',
                extra_metadata: ''
            },
            series: [],
            staticData: staticData
        }
    },
    methods: {
        fetchSeries() {
            (async () => {
                const rawResponse = await fetch('/series/all', { credentials: 'include', headers: this.$store.state.fetchHeaders })
                const response = await rawResponse.json()
                this.series = response
            })()
        },
        addBook() {
            (async () => {
                const rawResponse = await fetch('/books/add', {
                    credentials: 'include',
                    method: 'POST',
                    headers: this.$store.state.fetchHeaders,
                    body: JSON.stringify(this.book)
                })
                const response = await rawResponse.json()

                if(response.success) {
                    this.$router.push({ path: '/books' })
                } else {
                    this.alertify.error(response.message)
                }
            })()
        }
    },
    created() {
        this.fetchSeries()
    }
}
</script>

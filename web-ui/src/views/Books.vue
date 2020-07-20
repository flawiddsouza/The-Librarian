<template>
    <div>
        <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <li>
                    <router-link to="/">Home</router-link>
                </li>
                <li class="is-active">
                    <router-link to="/books" aria-current="page">Books</router-link>
                </li>
            </ul>
        </nav>
        <div class="tabs is-toggle">
            <ul>
                <li v-bind:class="[status === 'All' ? 'is-active' : '']">
                    <a @click="switchStatus('All')">All</a>
                </li>
                <li v-bind:class="[status === 'Currently Reading' ? 'is-active' : '']">
                    <a @click="switchStatus('Currently Reading')">Currently Reading</a>
                </li>
                <li v-bind:class="[status === 'Read' ? 'is-active' : '']">
                    <a @click="switchStatus('Read')">Read</a>
                </li>
            </ul>
        </div>
        <div class="tabs is-toggle">
            <ul>
                <li v-bind:class="[type === 'All' ? 'is-active' : '']">
                    <a @click="switchType('All')">All</a>
                </li>
                <li v-bind:class="[type === bookType ? 'is-active' : '']" v-for="bookType in bookTypes">
                    <a @click="switchType(bookType)">{{ bookType }}</a>
                </li>
            </ul>
        </div>
        <div class="columns" v-for="books in chunkedBooks">
            <div class="column is-one-fifth" v-for="book in books">
                <div class="card">
                    <div class="card-image">
                        <router-link :to="`/books/${book.id}`">
                            <figure class="image is-2by3" v-if="book.cover_image">
                                <img :src="book.cover_image" v-if="book.cover_image">
                                <h1 class="title" v-else>{{ book.name }} by {{ book.author }}</h1>
                            </figure>
                            <div class="book" v-else>
                                <div class="title">
                                    <div class="big">{{ book.name }}</div>
                                    <div class="small">by {{ book.author }}</div>
                                </div>
                            </div>
                        </router-link>
                    </div>
                    <footer class="card-footer">
                        <a class="card-footer-item">
                            <span class="tag is-primary is-medium" v-if="book.type === 'Short Story Collection'">Short Stories</span>
                            <span class="tag is-primary is-medium" v-else>{{ book.type }}</span>
                        </a>
                        <a class="card-footer-item" @click="editBook(book.id)">Edit</a>
                        <a class="card-footer-item" @click="deleteBook(book.id)">Delete</a>
                    </footer>
                </div>
            </div>
        </div>
        <div v-if="chunkedBooks.length == 0">
            No books found.
        </div>
    </div>
</template>

<script>
function chunk(arr, len) {
    var chunks = []
    var i = 0
    while (i < arr.length) {
        chunks.push(arr.slice(i, i += len))
    }
    return chunks
}

import staticData from './../static_data'

export default {
    data() {
        return {
            fetchURL: '/books/all',
            type: 'All',
            status: 'All',
            bookTypes: staticData.bookTypes,
            books: [],
        }
    },
    methods: {
        fetchBooks() {
            (async () => {
                const rawResponse = await fetch(`${this.fetchURL}?type=${this.type}&status=${this.status}`, { credentials: 'include', headers: this.$store.state.fetchHeaders })
                const response = await rawResponse.json()
                this.books = response
                if('success' in response && !response.success) {
                    this.alertify.error(response.message)
                }
            })()
        },
        editBook(id) {
            this.$router.push({ path: `/books/${id}/edit` })
        },
        deleteBook(id, index) {
            if(confirm('Are you sure?')) {
                (async () => {
                    const rawResponse = await fetch(`/books/${id}`, {
                        credentials: 'include',
                        headers: this.$store.state.fetchHeaders,
                        method: 'DELETE'
                    })
                    const response = await rawResponse.json()

                    if(response.success) {
                        this.books.some((book, index) => {
                            if(book.id === id) {
                                this.books.splice(index, 1)
                                return true
                            }
                        })
                    } else {
                        this.alertify.error(response.message)
                    }
                })()
            }
        },
        switchType(type) {
            this.type = type
            this.fetchBooks()
            localStorage.setItem('filterBooksType', type)
        },
        switchStatus(status) {
            this.status = status
            this.fetchBooks()
            localStorage.setItem('filterBooksStatus', status)
        }
    },
    computed: {
        chunkedBooks() {
            return chunk(this.books, 5)
        }
    },
    created() {
        this.type = localStorage.getItem('filterBooksType') || 'All'
        this.status = localStorage.getItem('filterBooksStatus') || 'All'
        this.fetchBooks()
    }
}
</script>

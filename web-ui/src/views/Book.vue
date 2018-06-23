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
                    <router-link :to="`/books/${this.$route.params.id}`" aria-current="page">{{ book.name }} by {{ book.author }}</router-link>
                </li>
            </ul>
        </nav>
        <div class="box">
            <div class="columns">
                <div class="column is-one-fifth">
                    <img v-if="book.cover_image" :src="book.cover_image">
                    <div class="book" v-else>
                        <div class="title">
                            <div class="big">{{ book.name }}</div>
                            <div class="small">by {{ book.author }}</div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <p>Book: {{ book.name }}</p>
                    <p>Author: {{ book.author }}</p>
                    <p>Type: {{ book.type }}</p>
                    <p v-if="book.version">Version: {{ book.version }}</p>
                    <div v-if="book.is_series">
                        <p>Series: {{ book.series_name }} #{{ book.series_index }}</p>
                    </div>
                    <p>Status: {{ book.status }}</p>
                    <p v-if="book.started_reading">Started Reading: {{ book.started_reading | formatDate }}</p>
                    <p v-if="book.completed_reading">Completed Reading: {{ book.completed_reading | formatDate }}</p>
                    <p v-if="book.extra_metadata">Extra info: {{ book.extra_metadata }}</p>
                    <p>Added on: {{ book.created_at | localizeDateTime }}</p>
                    <p>Last Updated On: {{ book.updated_at | localizeDateTime }}</p>
                </div>
                <div class="is-pulled-right is-hidden-touch">
                    <button class="button" @click="editBook(book.id)">Edit</button>
                    <button class="button is-danger is-outlined" @click="deleteBook(book.id)">Delete</button>
                </div>
                <div class="is-hidden-desktop">
                    <button class="button" @click="editBook(book.id)">Edit</button>
                    <button class="button is-danger is-outlined" @click="deleteBook(book.id)">Delete</button>
                </div>
            </div>
        </div>
        <div class="box" v-if="notes.length > 0">
            <h1 class="title is-4">
                Notes
                <button class="button is-pulled-right" @click="notesActions = !notesActions">Actions</button>
            </h1>
            <div v-for="(note, index) in notes">
                <div v-if="notesActions" class="is-pulled-right">
                    <button class="button is-small" @click="cancelEdit(index)" v-if="note.edit">Cancel</button>
                    <button class="button is-small" @click="updateNote(index)" v-if="note.edit">Update</button>
                    <button class="button is-small" @click="editNote(index)" v-if="!note.edit">Edit</button>
                    <button class="button is-small is-danger is-outlined" @click="deleteNote(note.id, index)">Delete</button>
                </div>
                <div class="has-text-primary">
                    <span v-if="!note.edit">{{ note.marker }}</span>
                    <input class="input is-inline" type="text" v-model="note.marker" v-else>
                </div>
                <div>
                    <span class="preserve-linebreaks" v-if="!note.edit">{{ note.note }}</span>
                    <textarea class="textarea" v-model="note.note" v-else></textarea>
                </div>
                <div class="datetime">{{ note.created_at | localizeDateTime }}</div>
                <br v-if="index !== notes.length - 1">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            book: {},
            notes: [],
            notesActions: false
        }
    },
    methods: {
        fetchBook() {
            (async () => {
                const rawResponse = await fetch(`/books/${this.$route.params.id}`, { credentials: 'include', headers: this.$store.state.fetchHeaders })
                const response = await rawResponse.json()
                this.book = response
            })()
        },
        fetchNotes() {
            (async () => {
                const rawResponse = await fetch(`/notes/${this.$route.params.id}`, { credentials: 'include', headers: this.$store.state.fetchHeaders })
                const response = await rawResponse.json()
                this.notes = response
            })()
        },
        editBook(id) {
            this.$router.push({ path: `/books/${id}/edit` })
        },
        deleteBook(id) {
            if(confirm('Are you sure?')) {
                (async () => {
                    const rawResponse = await fetch(`/books/${id}`, {
                        credentials: 'include',
                        headers: this.$store.state.fetchHeaders,
                        method: 'DELETE'
                    })
                    const response = await rawResponse.json()

                    if(response.success) {
                        this.alertify.success(`Book "${this.book.name} by ${this.book.author}" has been deleted`)
                        this.$router.push({ path: '/books' })
                    } else {
                        console.log(response.error)
                    }
                })()
            }
        },
        editNote(index) {
            this.notes.splice(index, 1, Object.assign(this.notes[index], { edit: true, original: Object.assign({}, this.notes[index]) }))
        },
        updateNote(index) {
            (async () => {
                const rawResponse = await fetch(`/notes/${this.notes[index].id}`, {
                    credentials: 'include',
                    method: 'PATCH',
                    headers: this.$store.state.fetchHeaders,
                    body: JSON.stringify(this.notes[index])
                })
                const response = await rawResponse.json()

                if(response.success) {
                    this.notes.splice(index, 1, Object.assign(this.notes[index], { edit: false }))
                    this.alertify.success('Note updated')
                } else {
                    this.alertify.error("Note coudn't be updated")
                    console.log(response.error)
                }
            })()
        },
        cancelEdit(index) {
            this.notes.splice(index, 1, Object.assign(this.notes[index].original, { edit: false }))
        },
        deleteNote(id, index) {
            if(confirm('Are you sure?')) {
                (async () => {
                    const rawResponse = await fetch(`/notes/${id}`, {
                        credentials: 'include',
                        headers: this.$store.state.fetchHeaders,
                        method: 'DELETE'
                    })
                    const response = await rawResponse.json()

                    if(response.success) {
                        this.alertify.success(`Note deleted`)
                        this.notes.splice(index, 1)
                    } else {
                        console.log(response.error)
                    }
                })()
            }
        }
    },
    created() {
        this.fetchBook()
        this.fetchNotes()
    }
}
</script>

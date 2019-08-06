<template>
    <div>
        <div class="box" v-if="books.length > 0">
            <form @submit.prevent="addNote">
                <div class="field">
                    <label class="label">Pick a book from the list</label>
                    <div class="select">
                        <select v-model="note.book_id">
                            <option v-for="book in books" :value="book.id">{{ book.name }} by {{ book.author }}</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Marker</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="Page 20" v-model="note.marker" required v-focus>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Note</label>
                    <div class="control">
                        <textarea class="textarea" v-model="note.note" required></textarea>
                    </div>
                </div>
                <div class="control">
                    <button class="button is-link">Add</button>
                </div>
            </form>
        </div>
        <div class="box" v-else>
            You're currently not reading any books.
        </div>
        <div class="box" v-if="Object.keys(notes).length > 0">
            <h1 class="title is-4">Recent Notes</h1>
            <div v-for="(notesArray, book_id) in notes" :class="{ 'mt-1em': Object.keys(notes)[0] !== book_id }">
                <p style="margin-bottom: 0.5em"><router-link :to="`/books/${book_id}`">{{ getBookName(book_id) }}</router-link></p>
                <div v-for="(note, index) in notesArray" style="margin-left: 1em">
                    <div class="has-text-primary">{{ note.marker }}</div>
                    <div>
                        <span class="preserve-linebreaks">{{ note.note }}</span>
                    </div>
                    <div class="datetime">{{ note.created_at | localizeDateTime }}</div>
                    <br v-if="index !== notesArray.length - 1">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// from [{ animal: 'cat', name: 'Tom' }, { animal: 'dog', name: 'Puggy' }, { animal: 'cat', name: 'Jack' }] // if `animal` is passed as the property
// to { 'cat': [{ animal: 'cat', name: 'Tom' }, { animal: 'cat', name: 'Jack' }], 'dog': [{ animal: 'dog', name: 'Puggy' }]}
function createGroupedArray(array, property) {
    if(Array.isArray(array)) {
        return array.reduce((r, a) => {
            r[a[property]] = r[a[property]] || []
            r[a[property]].push(a)
            return r
        }, Object.create(null))
    } else {
        return null
    }
}

export default {
    data () {
        return {
            notes: {},
            rawNotes: [],
            books: [],
            note: {
                book_id: '',
                marker: '',
                note: ''
            }
        }
    },
    methods: {
        fetchNotes() {
            (async () => {
                const rawResponse = await fetch(`/notes/all?count=5`, { credentials: 'include', headers: this.$store.state.fetchHeaders })
                const response = await rawResponse.json()
                this.rawNotes = response
                this.notes = createGroupedArray(response, 'book_id')
                this.handleFailedResponse(response)
            })()
        },
        fetchBooks() {
            (async () => {
                const rawResponse = await fetch(`/books/all?status=Currently Reading`, { credentials: 'include', headers: this.$store.state.fetchHeaders })
                const response = await rawResponse.json()
                this.books = response
                if(this.books.length > 0) {
                    this.note.book_id = this.books[0].id
                }
                // fetchNotes gets called first, so I don't need to handleFailedResponse here
            })()
        },
        addNote() {
            (async () => {
                const rawResponse = await fetch('/notes/add', {
                    credentials: 'include',
                    method: 'POST',
                    headers: this.$store.state.fetchHeaders,
                    body: JSON.stringify(this.note)
                })
                const response = await rawResponse.json()

                if(response.success) {
                    this.fetchNotes()
                    this.note.marker = ''
                    this.note.note = ''
                } else {
                    this.alertify.error(response.message)
                }
            })()
        },
        getBookName(book_id) {
            var book = this.rawNotes.find(note => note.book_id == book_id) // don't use `===` here, since our book_id can also be a string at times
            if(book) {
                return book.book_name
            } else {
                return 'Book name couldn\'t be extracted from the notes array'
            }
        }
    },
    created() {
        if(!localStorage.getItem('token')) {
            this.$router.push({ path: '/login' })
        }
        this.fetchNotes()
        this.fetchBooks()
    }
}
</script>

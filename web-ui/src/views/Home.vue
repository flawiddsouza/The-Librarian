<template>
    <div>
        <div class="box">
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
        <div class="box" v-if="notes.length > 0">
            <h1 class="title is-4">Recent Notes</h1>
            <div v-for="(note, index) in notes">
                <p><router-link :to="`/books/${note.book_id}`">{{ getBookName(note.book_id) }}</router-link></p>
                <p style="margin-left: 2em">{{ note.updated_at | localizeDateTime }}</p>
                <p style="margin-left: 4em">{{ note.marker }}: <span class="preserve-linebreaks">{{ note.note }}</span></p>
                <br v-if="index !== notes.length - 1">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            notes: [],
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
                const rawResponse = await fetch(`/notes/all?count=20`, { credentials: 'include' })
                const response = await rawResponse.json()
                this.notes = response
            })()
        },
        fetchBooks() {
            (async () => {
                const rawResponse = await fetch(`/books/all?status=Currently Reading`, { credentials: 'include' })
                const response = await rawResponse.json()
                this.books = response
                if(this.books.length > 0) {
                    this.note.book_id = this.books[0].id
                }
            })()
        },
        addNote() {
            (async () => {
                const rawResponse = await fetch('/notes/add', {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.note)
                })
                const response = await rawResponse.json()

                if(response.success) {
                    this.fetchNotes()
                    this.note.marker = ''
                    this.note.note = ''
                } else {
                    console.log(response.error)
                }
            })()
        },
        getBookName(book_id) {
            var book = this.books.filter(book => book.id === book_id)[0] || null;
            if(book) {
                return book.name
            } else {
                return 'Untitled'
            }
        }
    },
    created() {
        this.fetchNotes()
        this.fetchBooks()
    }
}
</script>

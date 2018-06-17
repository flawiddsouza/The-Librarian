import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Home from './views/Home.vue'
import Books from './views/Books.vue'
import AddBook from './views/AddBook.vue'
import Book from './views/Book.vue'
import EditBook from './views/EditBook.vue'
import Series from './views/Series.vue'

export default new Router({
    routes: [
        { path: '/', component: Home },
        { path: '/books', component: Books },
        { path: '/books/add', component: AddBook },
        { path: '/books/:id', component: Book },
        { path: '/books/:id/edit', component: EditBook },
        { path: '/series', component: Series }
    ]
})

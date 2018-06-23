import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'bulma'
import './scss/main.scss'

import moment from 'moment'
Vue.filter('localizeDateTime', value => {
    return moment.utc(value).local().format('DD-MMM-YY h:mm A')
})
Vue.filter('formatDate', value => {
    return moment(value).format('DD-MMM-YY')
})

import alertify from 'alertify.js'
Vue.prototype.alertify = alertify

import vSelect from 'vue-select'
Vue.component('v-select', vSelect)

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
    if(to.meta.title) {
        document.title = to.meta.title + ' - The Librarian'
    } else {
        document.title = 'The Librarian - A Minimalistic App for Tracking Your Reading'
    }
    next()
})

// adds `v-show` custom directive which allows an element to receive focus on page load
Vue.directive('focus', {
    // When the bound element is inserted into the DOM...
    inserted(el) {
        // Focus the element
        el.focus()
    }
})

new Vue({
    router,
    store,
    watch: {
        '$route': function(to, from) {
            if(!this.$store.state.token) {
                var username = localStorage.getItem('username')
                var password = localStorage.getItem('password')
                if(username && password) {
                    (async () => {
                        const rawResponse = await fetch('/auth/token', {
                            credentials: 'include',
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ username: username, password: password })
                        })
                        const response = await rawResponse.json()

                        if(response.success) {
                            this.$store.commit('updateToken', response.token)
                            this.$store.commit('refreshFetchHeaders')
                            this.$router.go() // reload current route, whichever it is
                        } else {
                            this.alertify.error(response.message)
                            this.$router.push({ path: '/login' })
                        }
                    })()
                }
            }
        }
    },
    render: h => h(App)
}).$mount('#app')

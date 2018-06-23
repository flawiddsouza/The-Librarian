import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        token: localStorage.getItem('token'),
        fetchHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        }
    },
    mutations: {
        updateToken: (state, token) => {
            state.token = token
            localStorage.setItem('token', token)
        },
        refreshFetchHeaders: (state) => {
            state.fetchHeaders = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        }
    }
})

<template>
    <div>
        <section class="hero is-warning is-bold is-hidden-touch">
            <div class="hero-body">
                <div class="container">
                    <h1 class="title">
                        <router-link to="/">
                            The Librarian
                        </router-link>
                    </h1>
                    <h2 class="subtitle">
                        A Minimalistic App for Tracking Your Reading
                    </h2>
                </div>
            </div>
        </section>
        <nav class="navbar has-shadow" role="navigation" aria-label="dropdown navigation">
            <div class="container">
                <div class="navbar-brand is-hidden-desktop">
                    <router-link to="/" class="navbar-item mobile-heading">The Librarian</router-link>
                    <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false">
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>
                <div class="navbar-menu">
                    <div class="navbar-end" v-if="authToken">
                        <router-link to="/books" class="navbar-item">Books</router-link>
                        <router-link to="/books/add" class="navbar-item">Add Book</router-link>
                        <router-link to="/series" class="navbar-item">Series</router-link>
                        <a @click="logout" class="navbar-item">Logout</a>
                    </div>
                    <div class="navbar-end" v-else>
                        <router-link to="/login" class="navbar-item">Login</router-link>
                        <router-link to="/register" class="navbar-item">Register</router-link>
                    </div>
                </div>
            </div>
        </nav>
        <section class="section">
            <div class="container">
                <router-view></router-view>
            </div>
        </section>
    </div>
</template>

<script>
document.addEventListener('DOMContentLoaded', () => {
    var navBurger = document.querySelector('.navbar-burger')
    var navMenu = document.querySelector('.navbar-menu')
    navBurger.addEventListener('click', () => {
        navBurger.classList.toggle('is-active')
        navMenu.classList.toggle('is-active')
    })
})

export default {
    methods: {
        logout() {
            if(confirm('Are you sure?')) {
                this.$store.commit('updateToken', null)
                localStorage.clear()
                this.$router.push('/login')
            }
        }
    },
    computed: {
        authToken() {
            return this.$store.state.token
        }
    }
}
</script>

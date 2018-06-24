<template>
    <div>
        <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <li>
                    <router-link to="/">Home</router-link>
                </li>
                <li class="is-active">
                    <router-link to="/login" aria-current="page">Login</router-link>
                </li>
            </ul>
        </nav>
        <div class="box">
            <form @submit.prevent="login">
                <div class="field">
                    <label class="label">Username</label>
                    <div class="control">
                        <input class="input" type="text" v-model="username" required v-focus>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Password</label>
                    <div class="control">
                        <input class="input" type="password" v-model="password" required>
                    </div>
                </div>
                <div class="control">
                    <button class="button is-link">Login</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            password: ''
        }
    },
    methods: {
        login() {
            (async () => {
                const rawResponse = await fetch('/auth/token', {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: this.username, password: this.password })
                })
                const response = await rawResponse.json()

                if(response.success) {
                    this.alertify.success('Logged in')
                    localStorage.setItem('username', this.username)
                    localStorage.setItem('password', this.password)
                    this.$store.commit('updateToken', response.token)
                    this.$store.commit('refreshFetchHeaders')
                    this.$router.push({ path: '/' })
                } else {
                    this.alertify.error(response.message)
                }
            })()
        }
    },
    created() {
        if(this.$store.state.token) {
            this.$router.push({ path: '/' })
        }
    }
}
</script>

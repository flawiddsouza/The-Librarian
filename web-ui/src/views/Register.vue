<template>
    <div>
        <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <li>
                    <router-link to="/">Home</router-link>
                </li>
                <li class="is-active">
                    <router-link to="/register" aria-current="page">Register</router-link>
                </li>
            </ul>
        </nav>
        <div class="box">
            <form @submit.prevent="register">
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
                    <button class="button is-link">Register</button>
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
        register() {
            (async () => {
                const rawResponse = await fetch('/auth/register', {
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
                    this.alertify.success(response.message)
                    localStorage.setItem('username', this.username)
                    localStorage.setItem('password', this.password)
                    this.$router.push({ path: '/' })
                } else {
                    this.alertify.error(response.message)
                }
            })()
        }
    }
}
</script>

<template>
    <div>
        <section class="hero is-warning is-bold">
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
                <div class="navbar-menu">
                    <div class="navbar-end">
                        <router-link to="/books" class="navbar-item">Books</router-link>
                        <router-link to="/books/add" class="navbar-item">Add Book</router-link>
                        <router-link to="/series" class="navbar-item">Series</router-link>
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

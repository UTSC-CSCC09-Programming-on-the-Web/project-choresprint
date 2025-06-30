<script setup lang="ts">
</script>

<template>
  <nav>
    <router-link to="/dashboard">Dashboard</router-link>
    <router-link to="/chores">Chores</router-link>"
    <router-link to="/draft-lobby">Draft Lobby</router-link>
  </nav>
  <router-view />
</template>

<style scoped>
nav {
  padding: 1rem;
}
nav a {
  margin-right: 0.5rem;
}
</style>
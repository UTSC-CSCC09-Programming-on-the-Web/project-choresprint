<script setup lang="ts">
import HouseCard from '../components/HouseCard.vue'

interface House {
  id: number
  name: string
  members: number
  chores: number
}

// sample data for houses
const houses: House[] = [
  { id: 1, name: 'Cottage', members: 3, chores: 5 },
  { id: 2, name: 'Beach House', members: 5, chores: 2 }
]
</script>

<template>
  <div class="dashboard-page">
    <h1>Dashboard</h1>
    <section class="houses-section">
      <h2>Your Houses</h2>
      <ul class="house-list">
        <HouseCard
          v-for="h in houses"
          :key="h.id"
          :name="h.name"
          :members="h.members"
          :chores="h.chores"
        />
      </ul>
    </section>
  </div>
</template>

<style scoped>
.dashboard-page {
  max-width: 600px;
  margin: 0 auto;
}
.houses-section {
  margin-top: 2rem;
}
.house-list {
  list-style: none;
  padding: 0;
}
.note {
  margin-top: 1rem;
  font-style: italic;
  color: #686868;
}
</style>
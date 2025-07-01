<script setup lang="ts">
import ChoreCard from '../components/ChoreCard.vue'

interface House {
  id: number
  name: string
}

interface Chore {
  id: number
  title: string
  points: number
}

// sample house from the dashboard
const houses: House[] = [
  { id: 1, name: 'Cottage' }
]

// sample data for chores
const chores: Chore[] = [
  { id: 1, title: 'Take out trash', points: 5 },
  { id: 2, title: 'Clean kitchen', points: 8 },
  { id: 3, title: 'Mow lawn', points: 10 }
]
</script>

<template>
  <div class="chores-page">
    <h1>Chores</h1>

    <section class="house-section">
      <label class="house-label">
        Select House:
        <select disabled>
          <option>{{ houses[0].name }}</option>
        </select>
      </label>
    </section>

    <section class="list-section">
      <h2>Chores for House</h2>
      <ul class="chore-list">
        <ChoreCard
          v-for="c in chores"
          :key="c.id"
          :title="c.title"
          :points="c.points"
        />
      </ul>
    </section>
  </div>
</template>

<style scoped>
.chores-page {
  max-width: 600px;
  margin: 0 auto;
}
.house-section,
.list-section {
  margin-top: 2rem;
}
.house-label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
}
select {
  margin-top: 0.5rem;
  padding: 0.5rem;
}
.chore-list {
  list-style: none;
  padding: 0;
}
.note {
  margin-top: 1rem;
  font-style: italic;
  color: #6c6c6c;
}
</style>
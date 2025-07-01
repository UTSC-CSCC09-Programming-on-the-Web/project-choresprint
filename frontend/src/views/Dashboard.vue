<template>
  <div>
    <h1>Dashboard</h1>

    <div>
      <h2>Your Houses</h2>
      <form @submit.prevent="createHouse">
        <input v-model="newHouseName" placeholder="New house name" />
        <button type="submit">Add House</button>
      </form>
      <ul>
        <li v-for="house in houses" :key="house.id">
          {{ house.name }} ({{ house._count.userHouses }} members, {{
          house._count.chores }} chores)
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface House {
  id: number
  name: string
  _count: { userHouses: number; chores: number }
}

// ref to hold house data
const houses = ref<House[]>([])
const newHouseName = ref('')
const token = localStorage.getItem('accessToken') || ''

// fetch houses 
const fetchHouses = async () => {
  const res = await fetch('/api/houses', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) {
    const data = await res.json()
    houses.value = data.data
  }
}

// create a new house
const createHouse = async () => {
  if (!newHouseName.value) return
  await fetch('/api/houses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: newHouseName.value, userId: 1 }),
  })
  newHouseName.value = ''
  fetchHouses()
}

onMounted(fetchHouses) // fetch houses on component mount
</script>
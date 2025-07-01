<template>
  <div>
    <h1>Chores</h1>

    <div>
      <label>
        Select House:
        <select v-model="selectedHouseId">
          <option disabled value="">-- Choose --</option>
          <option v-for="h in houses" :value="h.id" :key="h.id">
            {{ h.name }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="selectedHouseId">
      <h2>Chores for House {{ selectedHouseId }}</h2>
      <form @submit.prevent="createChore">
        <input v-model="newChoreTitle" placeholder="Title" />
        <input v-model.number="newChorePoints" placeholder="Points" type="number" />
        <button type="submit">Add Chore</button>
      </form>
      <ul>
        <li v-for="chore in chores" :key="chore.id">
          {{ chore.title }} - {{ chore.points }} points
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface House { id: number; name: string }
interface Chore { id: number; title: string; points: number }

const token = localStorage.getItem('accessToken') || ''

// refs to hold house and chore data
const houses = ref<House[]>([])
const selectedHouseId = ref('')
const chores = ref<Chore[]>([])
const newChoreTitle = ref('')
const newChorePoints = ref<number | null>(null) // allow null for points input

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

// fetch chores for the selected house
const fetchChores = async () => {
  if (!selectedHouseId.value) return
  const res = await fetch(`/api/houses/${selectedHouseId.value}/chores`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) {
    const data = await res.json()
    chores.value = data.data
  }
}

// create a new chore
const createChore = async () => {
  if (!selectedHouseId.value || !newChoreTitle.value || newChorePoints.value === null) return
  await fetch('/api/chores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: newChoreTitle.value,
      houseId: selectedHouseId.value,
      points: newChorePoints.value,
    }),
  })
  newChoreTitle.value = ''
  newChorePoints.value = null
  fetchChores()
}

onMounted(fetchHouses) // fetch houses on mount
watch(selectedHouseId, fetchChores) // fetch chores when selected house changes
</script>
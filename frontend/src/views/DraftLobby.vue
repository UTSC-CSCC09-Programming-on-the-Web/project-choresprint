<script setup lang="ts">
import PlayerCard from '../components/PlayerCard.vue'

interface Player {
  id: number
  name: string
  ready: boolean
}

const players: Player[] = [
  { id: 1, name: 'Alice', ready: true },
  { id: 2, name: 'Bob', ready: false },
  { id: 3, name: 'Charlie', ready: false },
]
</script>

<template>
  <div class="lobby-page">
    <h1>Draft Lobby</h1>

    <section class="players-section">
      <h2>Players</h2>
      <ul class="player-list">
        <PlayerCard
          v-for="p in players"
          :key="p.id"
          :name="p.name"
          :ready="p.ready"
        />
      </ul>
    </section>

    <button disabled class="start-btn">Start Draft</button>
    <p class="note">Real-time lobby coming soon!</p>
  </div>
</template>

<style scoped>
.lobby-page {
  max-width: 600px;
  margin: 0 auto;
}
.players-section {
  margin-top: 2rem;
}
.player-list {
  list-style: none;
  padding: 0;
}
.start-btn {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
}
.note {
  margin-top: 1rem;
  font-style: italic;
  color: #6a6a6a;
}
</style>
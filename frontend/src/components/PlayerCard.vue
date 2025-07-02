<script setup lang="ts">
const props = defineProps<{ name: string; ready: boolean }>()
</script>

<template>
  <li class="player-card">
    <span>{{ props.name }}</span>
    <span class="status" :class="{ ready: props.ready }">
      {{ props.ready ? 'Ready' : 'Not Ready' }}
    </span>
  </li>
</template>

<style scoped>
.player-card {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  color: #333;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status {
  font-weight: bold;
}
.status.ready {
  color: #28a745;
}
</style>
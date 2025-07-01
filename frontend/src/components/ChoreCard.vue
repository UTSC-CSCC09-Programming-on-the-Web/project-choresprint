<script setup lang="ts">
const props = defineProps<{ title: string; points: number }>()
</script>

<template>
  <li class="chore-card">
    <h3>{{ props.title }}</h3>
    <span class="points">{{ props.points }} pts</span>
  </li>
</template>

<style scoped>
.chore-card {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: white;
  color: #2f2f2f;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.points {
  font-weight: bold;
  color: #646cff;
}
</style>
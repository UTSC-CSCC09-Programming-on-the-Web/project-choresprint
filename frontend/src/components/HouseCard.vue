<script setup lang="ts">
const props = defineProps<{ name: string; members: number; chores: number }>()
</script>

<template>
  <li class="house-card">
    <h3>{{ props.name }}</h3>
    <span class="info">
      {{ props.members }} members, {{ props.chores }} chores
    </span>
  </li>
</template>

<style scoped>
.house-card {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  color: #333;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info {
  font-weight: bold;
  color: #646cff;
}
</style>
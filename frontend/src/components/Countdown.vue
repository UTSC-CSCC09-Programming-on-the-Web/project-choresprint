<template>
  <span class="countdown">{{ display }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

// props interface for target date
interface Props {
  targetDate: string
}

const props = defineProps<Props>()
const display = ref('')
let timer: ReturnType<typeof setInterval> | null = null

// update countdown display
function update() {
  if (!props.targetDate) {
    display.value = ''
    timer && clearInterval(timer)
    return
  }
  const now = Date.now()
  const target = new Date(props.targetDate).getTime()
  const diff = target - now
  if (diff <= 0) {
    display.value = 'Past due'
    timer && clearInterval(timer)
    return
  }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  display.value = `${days}d ${hours}h ${minutes}m ${seconds}s`
}

// setup lifecycle hooks
onMounted(() => {
  update()
  timer = setInterval(update, 1000)
})

// cleanup timer on unmount
onUnmounted(() => {
  timer && clearInterval(timer)
})

// watch for changes to target date prop
watch(
  () => props.targetDate,
  () => {
    timer && clearInterval(timer)
    update()
    timer = setInterval(update, 1000)
  }
)
</script>

<style scoped>
.countdown {
  color: var(--gray-dark);
}
</style>
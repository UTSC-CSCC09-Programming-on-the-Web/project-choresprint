<template>
  <div class="chore-details-container-wrapper">
    <div class="chore-details-top-row">
      <router-link to="/dashboard" class="back-to-dashboard-btn">
        ← Back to Dashboard
      </router-link>
    </div>
    <div class="chore-details-container" v-if="chore">
      <div class="chore-details-main">
        <h1 class="chore-title">{{ chore.title }}</h1>
        <div class="chore-meta">
          <span v-if="chore.points" class="chore-points"
            >Points: {{ chore.points }}</span
          >
          <span v-if="chore.dueDate" class="chore-due"
            >Due: {{ formatDate(chore.dueDate) }}</span
          >

          <span v-if="chore.assignedToId" class="chore-assigned"
            >Assigned to:
            {{ houseStore.getMemberById(chore.assignedToId)?.name }}</span
          >
          <span v-else class="chore-assigned">Unassigned</span>
          <span v-if="chore.isCompleted" class="chore-status completed"
            >Completed</span
          >
          <span v-else-if="!chore.attempted" class="chore-status pending"
            >Pending</span
          >
          <span v-else class="chore-status failed">Failed</span>
        </div>
        <p v-if="chore.description" class="chore-description">
          {{ chore.description }}
        </p>
        <div v-if="chore.explanation" class="chore-explanation">
          <strong>Verification Note:</strong> {{ chore.explanation }}
        </div>
        <div v-else-if="chore.attempted && !chore.isCompleted"></div>
        <div v-else-if="chore.attempted && chore.isCompleted"></div>
      </div>
      <div class="chore-images">
        <div v-if="chore.referencePhotoUrl" class="chore-image-block">
          <div class="chore-image-label">Reference Photo</div>
          <img
            :src="chore.referencePhotoUrl"
            alt="Reference"
            class="chore-image"
          />
        </div>
        <div v-if="chore.photoUrl" class="chore-image-block">
          <div class="chore-image-label">Proof Photo</div>
          <img :src="chore.photoUrl" alt="Proof" class="chore-image" />
        </div>
      </div>
    </div>
    <div v-else class="loading-container">
      <div class="loader"></div>
      <p>Loading chore details...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useChoreStore } from "../stores/chores";
import { useHouseStore } from "../stores/house";

const route = useRoute();
const choreStore = useChoreStore();
const houseStore = useHouseStore();
const chore = ref<any>(null);

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

onMounted(async () => {
  const id = Number(route.params.id);
  // Try to find the chore in the store (userChores or chores)
  chore.value = await choreStore.fetchChoreById(id);
  // Optionally, fetch from API if not found
});
</script>

<style scoped>
.chore-details-container-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto 0 auto;
}
.chore-details-top-row {
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
/* Back to Dashboard button styles */
.back-to-dashboard-btn {
  display: inline-block;
  margin-bottom: var(--spacing-lg);
  padding: 0.5em 1.2em;
  background: var(--primary);
  color: var(--white);
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
  transition: background 0.15s;
}
.back-to-dashboard-btn:hover {
  background: var(--primary);
  color: var(--white);
}

.chore-details-container {
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: var(--spacing-2xl) var(--spacing-2xl);
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2xl);
  align-items: flex-start;
}
.chore-details-main {
  flex: 2;
  min-width: 0;
}
.chore-images {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-width: 220px;
  align-items: flex-start;
}
.chore-image-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
}
.chore-image-label {
  font-size: var(--font-size-xs);
  color: var(--gray);
  margin-bottom: var(--spacing-xs);
}
.chore-image {
  max-width: 100%;
  max-height: 440px;
  min-width: 220px;
  min-height: 180px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-light);
  object-fit: contain;
  background: var(--light);
}
@media (max-width: 900px) {
  .chore-details-container {
    flex-direction: column;
    gap: var(--spacing-xl);
    padding: var(--spacing-xl) var(--spacing-md);
  }
  .chore-images {
    flex-direction: row;
    gap: var(--spacing-xl);
    width: 100%;
    justify-content: flex-start;
    align-items: center;
  }
  .chore-image-block {
    align-items: flex-start;
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }
  .chore-details-top-row {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
  .chore-details-container-wrapper {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
}
.chore-title {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-lg);
  color: var(--primary);
  font-weight: 700;
}
.chore-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-md);
  color: var(--gray-dark);
  align-items: center;
}
.chore-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  text-align: center;
  padding: 0.4em 1.4em;
  border-radius: var(--radius-full);
  font-size: var(--font-size-md);
  margin-left: var(--spacing-xs);
  margin-right: var(--spacing-xs);
  vertical-align: middle;
  line-height: 1.2;
  height: 2.2em;
}
.chore-points {
  color: var(--primary);
  font-weight: 600;
}
.chore-due {
  color: var(--warning);
}
.chore-assigned {
  color: var(--secondary);
}
.chore-status.completed {
  color: var(--success);
  font-weight: 600;
}
.chore-status.failed {
  color: var(--error);
  font-weight: 600;
}
.chore-status.pending {
  color: var(--gray);
  font-weight: 600;
}
.chore-description {
  margin-bottom: var(--spacing-lg);
  color: var(--gray-dark);
  font-size: var(--font-size-md);
}
.chore-images {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}
.chore-image-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
}
.chore-image-label {
  font-size: var(--font-size-xs);
  color: var(--gray);
  margin-bottom: var(--spacing-xs);
}
.chore-image {
  max-width: 100%;
  max-height: 440px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-light);
  object-fit: contain;
  background: var(--light);
}
.chore-explanation {
  background: var(--light);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--gray-dark);
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-md);
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.loader {
  width: 32px;
  height: 32px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

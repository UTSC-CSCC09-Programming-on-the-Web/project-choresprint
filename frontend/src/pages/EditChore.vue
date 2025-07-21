<template>
  <div class="edit-chore-page">
    <div class="container">
      <div class="edit-chore-container card">
        <div class="card-header">
          <h2 class="card-title">Edit Chore</h2>
          <button @click="goBack" class="btn btn-sm btn-outline">
            Back to Dashboard
          </button>
        </div>

        <div v-if="loading" class="card-body centered">
          <div class="loader"></div>
          <p class="loading-text">Loading chore details...</p>
        </div>

        <form v-else @submit.prevent="updateChore" class="card-body">
          <div class="form-group">
            <label for="chore-title" class="form-label"
              >Title <span class="required">*</span></label
            >
            <div class="input-with-icon">
              <input
                id="chore-title"
                v-model="form.title"
                type="text"
                placeholder="Enter chore title"
                class="form-input"
                required
              />
              <span class="input-icon">✓</span>
            </div>
          </div>

          <div class="form-group">
            <label for="chore-description" class="form-label"
              >Description</label
            >
            <textarea
              id="chore-description"
              v-model="form.description"
              placeholder="Describe what needs to be done"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="chore-points" class="form-label"
                >Points <span class="required">*</span></label
              >
              <div class="input-with-badge">
                <input
                  id="chore-points"
                  v-model.number="form.points"
                  type="number"
                  min="1"
                  max="100"
                  class="form-input"
                  required
                />
                <span class="input-badge">pts</span>
              </div>
            </div>

            <div class="form-group">
              <label for="chore-due-date" class="form-label">Due Date</label>
              <input
                id="chore-due-date"
                v-model="form.dueDate"
                type="date"
                class="form-input"
                :min="today"
                :max="maxDate"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="chore-assigned-to" class="form-label">Assign To</label>
            <div class="select-wrapper">
              <select
                id="chore-assigned-to"
                v-model="form.assignedToId"
                class="form-select"
              >
                <option value="">Unassigned</option>
                <option
                  v-for="member in houseMembers"
                  :key="member.id"
                  :value="member.id"
                >
                  {{ member.name }}
                </option>
              </select>
              <span class="select-icon">▼</span>
            </div>
          </div>

          <div class="form-group">
            <div class="checkbox-wrapper">
              <input
                type="checkbox"
                id="chore-completed"
                v-model="form.completed"
                class="form-checkbox"
              />
              <label for="chore-completed" class="checkbox-label">
                Mark as completed
              </label>
            </div>
          </div>

          <div v-if="error" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>

          <div class="card-footer">
            <div class="form-actions">
              <button
                @click="confirmDelete"
                type="button"
                class="btn btn-outline btn-danger"
              >
                Delete Chore
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="loader-inline"></span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useChoreManagement } from "../composables/useChoreManagement";

// Use the chore management composable
const {
  form,
  loading,
  saving,
  error,
  houseMembers,
  loadChoreData,
  updateChore,
  confirmDelete,
  goBack,
} = useChoreManagement();

// Get today's date in YYYY-MM-DD format
const today = computed(() => {
  const now = new Date();
  return now.toISOString().split("T")[0];
});

// Calculate max date as one year from today
const maxDate = computed(() => {
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  return future.toISOString().split("T")[0];
});

// Load chore data when component mounts
onMounted(() => {
  loadChoreData();
});
</script>

<style scoped>
/* Keeping the existing styles */
.edit-chore-page {
  padding: var(--spacing-xl) 0;
}

/* ... rest of the styles remain unchanged ... */
</style>

<style scoped>
/* Generated by GitHub Copilot */
.edit-chore-page {
  padding: var(--spacing-xl) 0;
}

.edit-chore-container {
  max-width: 700px;
  margin: 0 auto;
}

.card-title {
  margin-bottom: 0;
  color: var(--primary);
  font-size: var(--font-size-2xl);
}

.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-text {
  margin-top: var(--spacing-md);
  color: var(--gray);
}

.required {
  color: var(--error);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
}

.input-with-badge {
  position: relative;
}

.input-badge {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-size: var(--font-size-sm);
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-size: var(--font-size-xs);
  pointer-events: none;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.form-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--primary);
}

.checkbox-label {
  cursor: pointer;
  user-select: none;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.btn-danger {
  color: var(--error);
  border-color: var(--error);
}

.btn-danger:hover {
  background-color: var(--error);
  color: var(--white);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: var(--spacing-md);
  }

  .form-actions button {
    width: 100%;
  }
}
</style>

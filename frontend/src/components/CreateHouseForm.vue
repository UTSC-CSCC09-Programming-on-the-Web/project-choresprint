<template>
  <div class="create-house-form card">
    <form @submit.prevent="handleSubmit">
      <div class="card-header">
        <h2 class="form-title">Create a House</h2>
      </div>

      <div class="card-body">
        <!-- House name input field -->
        <div class="form-group">
          <label for="house-name" class="form-label">House Name</label>
          <div class="input-with-icon">
            <input
              id="house-name"
              v-model="houseName"
              placeholder="Enter your house name"
              class="form-input"
              :class="{ 'input-error': error }"
              required
              autocomplete="off"
            />
            <span class="input-icon">🏠</span>
          </div>
          <p class="form-hint">Choose a name for your household</p>
        </div>

        <!-- Error message display -->
        <div v-if="error" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>

        <!-- Success message display -->
        <div v-if="success" class="alert alert-success">
          <span class="alert-icon">✅</span>
          <span>House created successfully! Redirecting to dashboard...</span>
        </div>
      </div>

      <!-- Form actions -->
      <div class="card-footer">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !houseName.trim()"
        >
          <span v-if="loading" class="loader-inline"></span>
          <span v-else>Create House</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useHouseForm } from "../composables/useForms";

// Props and emits
const emit = defineEmits(["created"]);

// Use house form composable
const { houseName, loading, error, success, createHouse } = useHouseForm();

// Handle form submission
const handleSubmit = async () => {
  const result = await createHouse();
  if (result) {
    emit("created", result);
    // The composable handles the redirect
  }
};
</script>

<style scoped>
/* Keep all existing styles */
.create-house-form {
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.form-title {
  margin-bottom: 0;
  color: var(--primary);
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
  transition: color var(--transition-fast);
}

.form-input:focus + .input-icon {
  color: var(--primary);
}

.input-error {
  border-color: var(--error);
}

.alert {
  margin-top: var(--spacing-md);
}

.alert-icon {
  margin-right: var(--spacing-sm);
}

/* Animation for success state */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.alert-success {
  animation: pulse 1s infinite;
}
</style>

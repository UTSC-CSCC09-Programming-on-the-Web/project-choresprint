<template>
  <div class="join-house-form card">
    <form @submit.prevent="handleSubmit">
      <div class="card-header">
        <h2 class="form-title">Join a House</h2>
      </div>

      <div class="card-body">
        <!-- Invitation code input field -->
        <div class="form-group">
          <label for="invite-code" class="form-label">Invitation Code</label>
          <div class="input-with-icon">
            <input
              id="invite-code"
              v-model="inviteCode"
              placeholder="Enter invitation code"
              class="form-input"
              :class="{ 'input-error': error }"
              required
              autocomplete="off"
            />
            <span class="input-icon">🏠</span>
          </div>
          <p class="form-hint">Enter the code shared by the house owner</p>
        </div>

        <!-- Error message display -->
        <div v-if="error" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>

        <!-- Success message display -->
        <div v-if="success" class="alert alert-success">
          <span class="alert-icon">✅</span>
          <span>Successfully joined the house! Redirecting to dashboard...</span>
        </div>
      </div>

      <!-- Form actions -->
      <div class="card-footer">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !inviteCode.trim()"
        >
          <span v-if="loading" class="loader-inline"></span>
          <span v-else>Join House</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useJoinHouseForm } from "../composables/useForms";

// Props and emits
const emit = defineEmits(["joined"]);

// Router and route for possible code in URL
const route = useRoute();

// Use join house form composable
const {
  inviteCode,
  loading,
  error,
  success,
  joinHouse
} = useJoinHouseForm();

// Check for invitation code in route params
onMounted(() => {
  if (route.params.code) {
    inviteCode.value = route.params.code as string;
  }
});

// Handle form submission
const handleSubmit = async () => {
  const result = await joinHouse();
  if (result) {
    emit("joined", result);
    // The composable handles the redirect
  }
};
</script>

<style scoped>
/* Keep all existing styles */
.join-house-form {
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
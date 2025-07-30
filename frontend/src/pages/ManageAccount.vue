<template>
  <div class="manage-account container">
    <div class="account-card card">
      <div class="card-header">
        <h2 class="card-title">Manage Account</h2>
      </div>
      <div class="card-body">
        <div v-if="loading" class="centered">
          <div class="loader"></div>
        </div>
        <div v-else>
          <div class="form-group">
            <label class="form-label">
              <input
                type="checkbox"
                v-model="weeklyDigest"
                @change="saveDigest"
              />
              Receive weekly digest emails
            </label>
          </div>

          <div class="subscription-link">
            <RouterLink to="/manage-subscription" class="btn btn-primary">
              Manage Subscription
            </RouterLink>
          </div>

          <button class="btn btn-danger" @click="deleteAccount">
            Delete Account
          </button>

          <p v-if="error" class="error">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import userApiService from "../api/user";

const userStore = useUserStore();
const router = useRouter();

const weeklyDigest = ref(true);
const loading = ref(false);
const error = ref("");

// Load user preferences on mount
onMounted(async () => {
  try {
    loading.value = true;
    if (!userStore.user) {
      await userStore.initialize();
    }
    // Fetch user preferences
    if (userStore.user) {
      weeklyDigest.value = userStore.user.weeklyDigest ?? true;
    }
  } catch (err) {
    console.error("Failed to load account:", err);
    error.value = "Failed to load account details.";
  } finally {
    loading.value = false; // Reset loading state
  }
});

// Save weekly digest preference
async function saveDigest() {
  try {
    await userApiService.updatePreferences({
      weeklyDigest: weeklyDigest.value,
    });
  } catch (err) {
    console.error("Failed to update preferences:", err);
    error.value = "Failed to update preferences.";
  }
}

// Delete user account
async function deleteAccount() {
  if (!userStore.user) return;
  if (
    !confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    )
  ) {
    return;
  }
  try {
    await userStore.deleteAccount();
    router.push("/");
  } catch (err) {
    console.error("Failed to delete account:", err);
    error.value = "Failed to delete account.";
  }
}
</script>

<style scoped>
.manage-account {
  padding: var(--spacing-xl) 0;
}

.subscription-link {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.btn-danger {
  color: var(--error);
  border: 1px solid var(--error);
}

.btn-danger:hover {
  background-color: var(--error);
  color: var(--white);
}

.error {
  color: var(--error);
  margin-top: var(--spacing-md);
}
</style>

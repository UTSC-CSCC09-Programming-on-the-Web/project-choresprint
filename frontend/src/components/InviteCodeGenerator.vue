<template>
  <div class="invite-code-generator card">
    <div class="card-header">
      <h3 class="card-title">House Invitation</h3>
    </div>

    <div class="card-body">
      <div v-if="!inviteCode" class="invite-initial">
        <p class="invite-description">
          Generate an invitation code to allow others to join your house.
        </p>

        <button
          @click="generateInviteCode"
          :disabled="loading"
          class="btn btn-primary"
        >
          <span v-if="loading" class="loader-inline"></span>
          <span v-else>Generate Invitation Code</span>
        </button>
      </div>

      <div v-else class="invite-result">
        <div class="success-icon">✓</div>
        <h3 class="invite-heading">Invitation Code Generated!</h3>

        <div class="code-display">
          <code class="invite-code">{{ inviteCode }}</code>
          <button
            @click="copyToClipboard"
            class="btn btn-sm btn-outline copy-btn"
            :class="{ 'btn-success': copied }"
          >
            <span v-if="copied">Copied! ✓</span>
            <span v-else>Copy Code</span>
          </button>
        </div>

        <div class="invite-link">
          <p class="invite-link-label">Or share this link:</p>
          <div class="code-display">
            <code class="invite-url truncate">{{ inviteUrl }}</code>
            <button
              @click="copyInviteUrl"
              class="btn btn-sm btn-outline copy-btn"
              :class="{ 'btn-success': copiedUrl }"
            >
              <span v-if="copiedUrl">Copied! ✓</span>
              <span v-else>Copy URL</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-error mt-md">
        <span class="alert-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>
    </div>

    <div v-if="inviteCode" class="card-footer">
      <button @click="resetInvite" class="btn btn-sm btn-outline reset-btn">
        Generate New Code
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useInviteCodeGenerator } from "../composables/useForms";

// Props

// Use invite code generator composable
const {
  inviteCode,
  loading,
  error,
  copied,
  generateInviteCode,
  copyToClipboard,
} = useInviteCodeGenerator();

// Computed properties
const inviteUrl = computed(() => {
  if (!inviteCode.value) return "";
  const baseUrl = window.location.origin;
  return `${baseUrl}/join/${inviteCode.value}`;
});

const copiedUrl = computed(() => false); // You can add this to the composable if needed

// Copy URL to clipboard
function copyInviteUrl() {
  navigator.clipboard
    .writeText(inviteUrl.value)
    .then(() => {
      // Handle success - you might want to add this to the composable
      console.log("URL copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy URL: ", err);
    });
}

// Reset to generate new code
function resetInvite() {
  // Reset logic - you might want to add this to the composable
  inviteCode.value = "";
  error.value = "";
}
</script>

<style scoped>
/* Keep all existing styles */
.invite-code-generator {
  width: 100%;
}

.card-title {
  margin-bottom: 0;
  color: var(--primary);
}

.invite-initial {
  text-align: center;
  padding: var(--spacing-md) 0;
}

.invite-description {
  color: var(--gray);
  margin-bottom: var(--spacing-lg);
}

.invite-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn var(--transition-normal);
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: var(--success);
  color: white;
  border-radius: 50%;
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-md);
}

.invite-heading {
  color: var(--primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.code-display {
  display: flex;
  align-items: center;
  background-color: var(--light);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--gray-light);
  width: 100%;
}

.invite-code,
.invite-url {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: monospace;
  font-size: var(--font-size-base);
  color: var(--primary-dark);
  background-color: transparent;
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  min-width: 100px;
  transition: all var(--transition-fast);
}

.btn-success {
  background-color: var(--success);
  color: var(--white);
  border-color: var(--success);
}

.invite-link {
  margin-top: var(--spacing-md);
  width: 100%;
}

.invite-link-label {
  font-size: var(--font-size-sm);
  color: var(--gray);
  margin-bottom: var(--spacing-xs);
}

.reset-btn {
  margin-top: var(--spacing-md);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mt-md {
  margin-top: var(--spacing-md);
}

@media (max-width: 768px) {
  .code-display {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .invite-code,
  .invite-url {
    width: 100%;
    overflow: auto;
    white-space: normal;
    word-break: break-all;
  }

  .copy-btn {
    width: 100%;
  }
}
</style>

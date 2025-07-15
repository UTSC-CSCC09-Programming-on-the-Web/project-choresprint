<template>
  <div class="chore-completion-form">
    <!-- File upload input -->
    <div v-if="!chore.isCompleted" class="file-upload-section">
      <input
        :id="`file-upload-${choreId}`"
        type="file"
        accept="image/*"
        @change="handleImageChange"
        class="file-input"
        :disabled="loading"
      />
      <label
        :for="`file-upload-${choreId}`"
        class="file-upload-label"
        :class="{ disabled: loading }"
      >
        <span class="upload-icon">📸</span>
        <span class="upload-text">
          {{ form.proofPhoto ? "Change Photo" : "Upload Proof Photo" }}
        </span>
      </label>
    </div>

    <!-- Image preview -->
    <div v-if="!chore.isCompleted && previewUrl" class="image-preview">
      <img :src="previewUrl" alt="Proof preview" class="preview-image" />
      <button
        @click="removeImage"
        class="remove-image-btn"
        type="button"
        :disabled="loading"
      >
        ×
      </button>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Success message -->
    <div v-if="success" class="alert alert-success">
      Proof uploaded successfully! Your chore is now pending verification.
    </div>

    <!-- Action buttons -->
    <div v-if="!chore.isCompleted" class="action-buttons">
      <button
        @click="submitCompletion"
        :disabled="!form.proofPhoto || loading"
        class="btn btn-success btn-sm"
        :class="{ loading: loading }"
      >
        <span v-if="loading" class="loader-inline"></span>
        <span v-else>Submit Proof</span>
      </button>
    </div>

    <!-- Verification status -->
    <!-- Show pending state if proof was just submitted (loading) or if submitted but not attempted yet -->
    <div
      v-if="loading || (success && !chore.attempted)"
      class="verification-status pending"
    >
      <div class="status-indicator pending">
        <span class="status-icon">⏳</span>
        <span class="status-text">Pending Verification</span>
      </div>
      <p class="status-description">
        Your proof has been submitted and is being reviewed by AI. This may take
        a few minutes.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from "vue";
import { useChoreCompletionForm } from "../composables/useForms";

// Props
const props = defineProps({
  choreId: {
    type: Number,
    required: true,
  },
  chore: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(["completed", "error"]);

// Use the composable for chore completion
const {
  form,
  loading,
  error,
  success,
  submit,
  handleImageChange: composableHandleImageChange,
} = useChoreCompletionForm();

// Additional state for image preview (not in composable)
const previewUrl = ref(null);

// Computed
const isVerificationPending = computed(() => {
  return props.chore.attempted && !props.chore.isCompleted;
});

// Methods
function handleImageChange(event) {
  // Call the composable's image change handler
  composableHandleImageChange(event);

  // Handle preview URL creation
  const input = event.target;
  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Check file size (max 5MB) - already handled in composable, but keep for preview
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Create preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = URL.createObjectURL(file);
  }
}

function removeImage() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }

  previewUrl.value = null;
  form.value.proofPhoto = null;
  error.value = null;

  // Reset file input
  const fileInput = document.getElementById(`file-upload-${props.choreId}`);
  if (fileInput) {
    fileInput.value = "";
  }
}

async function submitCompletion() {
  try {
    await submit(props.choreId);

    // Clear form after successful submission
    removeImage();

    // Emit completion event
    emit("completed", props.choreId);
  } catch (err) {
    emit("error", err);
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
.chore-completion-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.file-upload-section {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--light);
  border: 2px dashed var(--gray-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.file-upload-label:hover:not(.disabled) {
  background-color: var(--gray-light);
  border-color: var(--primary);
}

.file-upload-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-icon {
  font-size: var(--font-size-lg);
}

.upload-text {
  color: var(--gray-dark);
  font-weight: 500;
}

.image-preview {
  position: relative;
  display: inline-block;
  max-width: 200px;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  border: 2px solid var(--light);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background-color: var(--error);
  color: var(--white);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}

.remove-image-btn:hover:not(:disabled) {
  background-color: #e03131;
}

.remove-image-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.btn.loading {
  pointer-events: none;
}

.loader-inline {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--white);
  animation: spin 1s ease-in-out infinite;
  margin-right: var(--spacing-xs);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.verification-status {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border-left: 4px solid;
}

.verification-status.failed {
  background-color: rgba(239, 68, 68, 0.1);
  border-left-color: var(--error);
}

.verification-status.completed {
  background-color: rgba(16, 185, 129, 0.1);
  border-left-color: var(--success);
}

.verification-status.pending {
  background-color: rgba(249, 168, 37, 0.1);
  border-left-color: var(--warning);
}

.verification-status.pending {
  background-color: rgba(255, 193, 7, 0.1);
  border-left-color: var(--warning);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.status-indicator.failed {
  color: var(--error);
}

.status-indicator.completed {
  color: var(--success);
}

.status-indicator.pending {
  color: var(--warning);
}

.status-icon {
  font-size: var(--font-size-lg);
}

.status-text {
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.status-description {
  color: var(--gray);
  font-size: var(--font-size-sm);
  margin: 0;
}

.alert {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.alert-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.btn-success {
  background-color: var(--success);
  color: var(--white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-weight: 500;
}

.btn-success:hover:not(:disabled) {
  background-color: #0ca678;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

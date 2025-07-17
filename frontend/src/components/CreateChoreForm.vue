<template>
  <div class="create-chore-form card">
    <form @submit.prevent="handleSubmit">
      <div class="card-header">
        <h2 class="form-title">Create a New Chore</h2>
      </div>

      <div class="card-body">
        <!-- Title input field -->
        <div class="form-group">
          <label for="chore-title" class="form-label"
            >Title <span class="required">*</span></label
          >
          <div class="input-with-icon">
            <input
              id="chore-title"
              v-model="form.title"
              type="text"
              required
              placeholder="Enter chore title"
              class="form-input"
              :class="{ 'input-error': error && !form.title.trim() }"
            />
            <span class="input-icon">✓</span>
          </div>
        </div>

        <!-- Description textarea field -->
        <div class="form-group">
          <label for="chore-description" class="form-label">Description</label>
          <textarea
            id="chore-description"
            v-model="form.description"
            placeholder="Describe what needs to be done"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <!-- Points and Due Date in a row -->
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
            <p class="form-hint">Higher points for harder chores</p>
          </div>

          <div class="form-group">
            <label for="chore-due-date" class="form-label">Due Date</label>
            <input
              id="chore-due-date"
              v-model="form.dueDate"
              type="date"
              class="form-input"
              :min="today"
            />
          </div>
        </div>

        <!-- Assign To dropdown -->
        <div class="form-group">
          <label for="chore-assigned-to" class="form-label">Assign To</label>
          <div class="select-wrapper">
            <select
              id="chore-assigned-to"
              v-model="form.assignedToId"
              class="form-select"
            >
              <option :value="null">Anyone</option>
              <option
                v-for="user in houseStore.houseMembers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }}
              </option>
            </select>
            <span class="select-icon">▼</span>
          </div>
        </div>

        <!-- Reference Image upload -->
        <div class="form-group">
          <label class="form-label"> Reference Image </label>
          <div class="file-input-wrapper">
            <label for="file-upload" class="file-upload-label">
              <span v-if="!previewUrl">Choose image</span>
              <span v-else>Change image</span>
              <span class="file-icon">📁</span>
            </label>
            <input
              id="file-upload"
              type="file"
              @change="handleImageChange"
              accept="image/*"
              class="file-input"
              required
            />
          </div>

          <!-- Image preview with animation -->
          <transition name="fade">
            <div v-if="previewUrl" class="image-preview">
              <img
                :src="previewUrl"
                alt="Reference image preview"
                class="preview-img"
              />
              <button
                type="button"
                class="remove-img-btn"
                @click="resetImage"
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          </transition>

          <p class="form-hint">
            Upload an image showing the completed state of the chore
          </p>
        </div>

        <!-- Error message -->
        <div v-if="error" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>

        <!-- Success message -->
        <div v-if="success" class="alert alert-success">
          <span class="alert-icon">✅</span>
          <span>Chore created successfully!</span>
        </div>
      </div>

      <div class="card-footer">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !form.title.trim() || !form.points"
        >
          <span v-if="loading" class="loader-inline"></span>
          <span v-else>Create Chore</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useHouseStore } from "../stores/house";
import { useChoreForm } from "../composables/useForms";

const emit = defineEmits(["created"]);

// Initialize stores
const houseStore = useHouseStore();

// Calculate today's date for the min attribute of the date input
const today = computed(() => {
  const now = new Date();
  return now.toISOString().split("T")[0];
});

// Use chore form composable
const {
  form,
  loading,
  error,
  success,
  previewUrl,
  handleImageChange,
  resetImage,
  createChore,
  resetForm,
} = useChoreForm();

// Load house members when component mounts
onMounted(async () => {
  if (houseStore.currentHouse?.id && houseStore.houseMembers.length === 0) {
    await houseStore.fetchHouseMembers(houseStore.currentHouse.id);
  }
});

// Handle form submission
const handleSubmit = async () => {
  const result = await createChore();
  if (result) {
    emit("created", result);
    resetForm();
  }
};
</script>

<style scoped>
/* Keep all existing styles */
.create-chore-form {
  width: 100%;
}

.form-title {
  margin-bottom: 0;
  color: var(--primary);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.required {
  color: var(--error);
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
  font-weight: 500;
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

.optional-label {
  font-size: var(--font-size-xs);
  color: var(--gray);
  font-weight: normal;
  margin-left: var(--spacing-xs);
}

.file-input-wrapper {
  display: inline-block;
  margin-bottom: var(--spacing-sm);
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--light);
  border: 1px solid var(--gray-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-upload-label:hover {
  background-color: var(--primary-light);
  color: var(--white);
}

.file-icon {
  font-size: 1.2em;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.image-preview {
  display: inline-block;
  margin-top: var(--spacing-md);
  border: 1px solid var(--gray-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
}

.preview-img {
  display: block;
  max-width: 200px;
  max-height: 150px;
  object-fit: contain;
}

.remove-img-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--gray-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.remove-img-btn:hover {
  background-color: var(--error);
  color: var(--white);
}

.input-error {
  border-color: var(--error);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>

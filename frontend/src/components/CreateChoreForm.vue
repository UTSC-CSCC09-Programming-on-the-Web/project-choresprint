<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-4 max-w-md mx-auto p-4 border rounded-lg shadow"
  >
    <h2 class="text-lg font-semibold">Create a Chore</h2>

    <div>
      <label class="block text-sm font-medium mb-1">Title</label>
      <input
        v-model="form.title"
        type="text"
        required
        class="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Description</label>
      <textarea
        v-model="form.description"
        class="w-full border px-3 py-2 rounded"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Points</label>
      <input
        v-model.number="form.points"
        type="number"
        min="1"
        class="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Reference Image</label>
      <input
        type="file"
        @change="handleFileChange"
        accept="image/*"
        class="w-full"
      />
    </div>

    <button
      type="submit"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Create Chore
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../api/index";

const props = defineProps<{
  houseId: number;
}>();

const form = ref({
  title: "",
  description: "",
  points: 10,
});
const referenceImage = ref<File | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    referenceImage.value = target.files[0];
  }
};

const handleSubmit = async () => {
  try {
    const houseId = props.houseId;

    const formData = new FormData();
    formData.append("title", form.value.title);
    formData.append("description", form.value.description || "");
    formData.append("points", String(form.value.points));
    formData.append("houseId", String(houseId));
    if (referenceImage.value) {
      formData.append("file", referenceImage.value);
    }

    await api.post(`/chores`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Chore created!");
    form.value = { title: "", description: "", points: 10 };
    referenceImage.value = null;
  } catch (err) {
    console.error("Failed to create chore", err);
    alert("Error creating chore");
  }
};
</script>

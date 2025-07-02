<template>
  <div class="max-w-md mx-auto mt-8">
    <h2 class="text-xl font-bold mb-4">Edit Chore</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <input
        v-model="form.title"
        type="text"
        placeholder="Title"
        class="w-full border px-3 py-2 rounded"
      />
      <textarea
        v-model="form.description"
        placeholder="Description"
        class="w-full border px-3 py-2 rounded"
      />
      <input
        v-model.number="form.points"
        type="number"
        class="w-full border px-3 py-2 rounded"
      />
      <label>
        Assign To:
        <select v-model="form.assignedToId">
          <option
            v-for="member in houseMembers"
            :key="member.id"
            :value="member.id"
          >
            {{ member.name }}
          </option>
        </select>
      </label>
      <label class="flex items-center space-x-2">
        <input type="checkbox" v-model="form.completed" />
        <span>Mark as completed</span>
      </label>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api/index";

const route = useRoute();
const router = useRouter();
const choreId = Number(route.params.id);

const form = ref({
  title: "",
  description: "",
  points: 10,
  completed: false,
  assignedToId: null,
});
const houseMembers = ref<any[]>([]);

onMounted(async () => {
  try {
    const res = await api.get(`/chores/${choreId}`);
    const data = res.data;
    const { data: members } = await api.get(`/houses/${data.houseId}/users`);
    houseMembers.value = members.data;
    form.value.title = data.title;
    form.value.description = data.description || "";
    form.value.points = data.points;
    form.value.completed = data.isCompleted;
    form.value.assignedToId = data.assignedToId;
  } catch (err) {
    console.error("Failed to fetch chore", err);
  }
});

const handleSubmit = async () => {
  try {
    await api.patch(`/chores/${choreId}`, form.value);
    alert("Chore updated");
    router.push("/dashboard");
  } catch (err) {
    console.error("Update failed", err);
    alert("Error updating chore");
  }
};
</script>

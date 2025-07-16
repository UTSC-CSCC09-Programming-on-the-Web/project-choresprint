import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChoreStore } from "../stores/chores";
import { useHouseStore } from "../stores/house";

export function useChoreManagement() {
  const route = useRoute();
  const router = useRouter();
  const choreStore = useChoreStore();
  const houseStore = useHouseStore();

  const choreId = computed(() => Number(route.params.id));

  // Form state
  const form = ref({
    title: "",
    description: "",
    points: 10,
    completed: false,
    assignedToId: null as number | null,
    dueDate: "",
  });

  // UI state
  const loading = ref(true);
  const saving = ref(false);
  const error = ref("");

  // Load chore data
  async function loadChoreData() {
    loading.value = true;
    error.value = "";

    try {
      // Load chore data
      const chore = await choreStore.fetchChoreById(choreId.value);

      if (!chore) {
        error.value = "Chore not found";
        return;
      }

      // Load house members
      if (chore.houseId) {
        await houseStore.fetchHouseMembers(chore.houseId);
      }

      // Populate form
      form.value = {
        title: chore.title || "",
        description: chore.description || "",
        points: chore.points || 10,
        completed: chore.isCompleted || false,
        assignedToId: chore.assignedToId || null,
        dueDate: chore.dueDate
          ? new Date(chore.dueDate).toISOString().split("T")[0]
          : "",
      };
    } catch (err: any) {
      error.value = err.message || "Failed to load chore details";
      console.error("Failed to fetch chore", err);
    } finally {
      loading.value = false;
    }
  }

  // Update chore
  async function updateChore() {
    if (!form.value.title.trim()) {
      error.value = "Title is required";
      return;
    }

    saving.value = true;
    error.value = "";

    try {
      await choreStore.updateChore(choreId.value, {
        title: form.value.title,
        description: form.value.description,
        points: form.value.points,
        isCompleted: form.value.completed,
        assignedToId: form.value.assignedToId,
        dueDate: form.value.dueDate || undefined,
        explanation: "", 
      });

      // Redirect to dashboard after successful update
      router.push("/dashboard");
      return true;
    } catch (err: any) {
      error.value = err.message || "Failed to update chore";
      console.error("Update failed", err);
      return false;
    } finally {
      saving.value = false;
    }
  }

  // Delete chore
  async function deleteChore() {
    saving.value = true;
    try {
      await choreStore.deleteChore(choreId.value);
      router.push("/dashboard");
      return true;
    } catch (err: any) {
      error.value = err.message || "Failed to delete chore";
      console.error("Delete failed", err);
      saving.value = false;
      return false;
    }
  }

  // Confirm before deleting
  function confirmDelete() {
    if (
      confirm(
        "Are you sure you want to delete this chore? This action cannot be undone."
      )
    ) {
      deleteChore();
    }
  }

  // Navigate back to dashboard
  function goBack() {
    router.push("/dashboard");
  }

  return {
    form,
    loading,
    saving,
    error,
    houseMembers: computed(() => houseStore.houseMembers),
    loadChoreData,
    updateChore,
    confirmDelete,
    goBack,
  };
}

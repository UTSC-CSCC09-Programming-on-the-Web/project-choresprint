import { ref } from "vue";
import { useUserStore } from "../stores/user";
import { useHouseStore } from "../stores/house";
import { useChoreStore } from "../stores/chores";

export function useDashboard() {
  // UI state - stores only handle data, UI state lives in composables and components
  const showCreateHouseForm = ref(false);
  const showJoinHouseForm = ref(false);
  const showCreateChoreModal = ref(false);
  const showInviteCodeModal = ref(false);
  const showManageMembersModal = ref(false);

  // Get all stores
  const userStore = useUserStore();
  const houseStore = useHouseStore();
  const choreStore = useChoreStore();

  // Initialize all data for the dashboard
  async function loadDashboard() {
    try {
      // Initialize user first
      await userStore.initialize();

      if (userStore.isLoggedIn && userStore.userId) {
        // Initialize house data
        await houseStore.initialize(userStore.userId);

        // If user has a house, load chores
        if (houseStore.currentHouse?.id) {
          await Promise.all([
            choreStore.fetchChores(houseStore.currentHouse.id),
            userStore.userId &&
              choreStore.fetchUserChores(
                houseStore.currentHouse.id,
                userStore.userId,
              ),
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to initialize dashboard:", error);
    }
  }

  // House form controls
  function openCreateHouse() {
    showCreateHouseForm.value = true;
    showJoinHouseForm.value = false;
  }

  function openJoinHouse() {
    showJoinHouseForm.value = true;
    showCreateHouseForm.value = false;
  }

  // Modal controls
  function openCreateChoreModal() {
    showCreateChoreModal.value = true;
  }

  function closeCreateChoreModal() {
    showCreateChoreModal.value = false;
  }

  function openInviteCodeModal() {
    showInviteCodeModal.value = true;
  }

  function closeInviteCodeModal() {
    showInviteCodeModal.value = false;
  }

  function openManageMembersModal() {
    showManageMembersModal.value = true;
  }

  function closeManageMembersModal() {
    showManageMembersModal.value = false;
  }

  // House management
  async function deleteHouse() {
    if (
      confirm(
        "Are you sure you want to delete this house? This action cannot be undone.",
      )
    ) {
      try {
        await houseStore.deleteHouse();
        choreStore.clearChores();
      } catch (error) {
        console.error("Error deleting house:", error);
      }
    }
  }

  async function leaveHouse() {
    if (
      confirm(
        "Are you sure you want to leave this house? You'll need a new invitation to rejoin.",
      )
    ) {
      try {
        await houseStore.leaveHouse();
        choreStore.clearChores();
      } catch (error) {
        console.error("Error leaving house:", error);
      }
    }
  }

  // Chore helpers
  async function markChoreComplete(choreId: number) {
    try {
      await choreStore.markChoreComplete(choreId);
    } catch (error) {
      console.error("Error completing chore:", error);
    }
  }

  // Date formatting
  function formatDate(dateString?: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return {
    // UI state
    showCreateHouseForm,
    showJoinHouseForm,
    showCreateChoreModal,
    showInviteCodeModal,
    showManageMembersModal,

    // Actions
    loadDashboard,
    openCreateHouse,
    openJoinHouse,
    openCreateChoreModal,
    closeCreateChoreModal,
    openInviteCodeModal,
    closeInviteCodeModal,
    openManageMembersModal,
    closeManageMembersModal,
    deleteHouse,
    leaveHouse,
    markChoreComplete,
    formatDate,
  };
}

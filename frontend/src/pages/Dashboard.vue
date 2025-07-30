<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useUserStore } from "../stores/user";
import { useHouseStore } from "../stores/house";
import { useChoreStore } from "../stores/chores";
import { useDashboard } from "../composables/useDashboard";
import { useSocket } from "../composables/useSocket";
import CreateChoreForm from "../components/CreateChoreForm.vue";
import CreateHouseForm from "../components/CreateHouseForm.vue";
import JoinHouseForm from "../components/JoinHouseForm.vue";
import InviteCodeGenerator from "../components/InviteCodeGenerator.vue";
import ChoreCompletionForm from "../components/ChoreCompletionForm.vue";
import ManageMembersModal from "../components/ManageMembersModal.vue";
import Countdown from "../components/Countdown.vue";
import { RouterLink } from "vue-router";

// Initialize stores
const userStore = useUserStore();
const houseStore = useHouseStore();
const choreStore = useChoreStore();

// Initialize socket
const { on, off } = useSocket();

// Get dashboard composable
const {
  showCreateHouseForm,
  showJoinHouseForm,
  showCreateChoreModal,
  showInviteCodeModal,
  showManageMembersModal,
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
} = useDashboard();

// Method to handle chore verification updates
function handleVerificationUpdate(data) {
  // Find the chore to get its points for optimistic update
  const chore =
    choreStore.chores.find((c) => c.id === data.choreId) ||
    choreStore.userChores.find((c) => c.id === data.choreId);

  // Update the chore using the proper store method to ensure reactivity
  choreStore.updateChoreVerificationStatus(
    data.choreId,
    data.verified,
    data.explanation
  );

  if (chore && data.verified && chore.points) {
    // Only update points if this is the current user's chore
    if (chore.assignedToId === userStore.userId) {
      // Optimistically update user points immediately
      userStore.updateUserPoints(chore.points);
      houseStore.updateMemberPoints(userStore.userId, chore.points);

      // Add visual feedback for points update
      const pointsElement = document.querySelector(".points-value");
      if (pointsElement) {
        pointsElement.classList.add("updated");
        setTimeout(() => {
          pointsElement.classList.remove("updated");
        }, 500);
      }
    }
  }
}

// Initialize on mount
onMounted(() => {
  loadDashboard();

  // Listen for chore verification events
  on("chore-verified", handleVerificationUpdate);
});

// Clean up on unmount
onUnmounted(() => {
  off("chore-verified", handleVerificationUpdate);
});
</script>

<template>
  <div class="dashboard-container">
    <!-- Loading state -->
    <div
      v-if="userStore.loading || houseStore.loading"
      class="loading-container"
    >
      <div class="loader"></div>
      <p class="loading-text">Loading your dashboard...</p>
    </div>

    <!-- Error state -->
    <div
      v-else-if="userStore.error || houseStore.error || choreStore.error"
      class="alert alert-error"
    >
      <div class="alert-content">
        <p class="alert-title">
          {{ userStore.error || houseStore.error || choreStore.error }}
        </p>
        <button @click="loadDashboard" class="btn btn-sm">Retry</button>
      </div>
    </div>

    <!-- Create/Join House state -->
    <div v-else-if="houseStore.showCreateJoin" class="container">
      <div class="card welcome-card">
        <div class="card-body text-center">
          <h2 class="welcome-title">Welcome to ChoreSprint!</h2>
          <p class="welcome-subtitle">
            You're not part of any house yet. Create your own or join an
            existing one.
          </p>

          <div class="action-buttons">
            <button @click="openCreateHouse" class="btn btn-primary">
              Create House
            </button>
            <button @click="openJoinHouse" class="btn btn-outline">
              Join House
            </button>
          </div>

          <div class="form-container">
            <CreateHouseForm
              v-if="showCreateHouseForm"
              @created="loadDashboard"
              class="house-form"
            />
            <JoinHouseForm
              v-if="showJoinHouseForm"
              @joined="loadDashboard"
              class="house-form"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard with house -->
    <div v-else class="container">
      <div class="dashboard-header">
        <div class="user-welcome">
          <h1 class="dashboard-title">
            Welcome back, {{ userStore.userName }}!
          </h1>
          <div class="user-points-display">
            <span class="points-label">Your Points:</span>
            <span class="points-value">{{ userStore.userPoints }} pts</span>
          </div>
        </div>
        <p class="dashboard-subtitle">Manage your house and chores</p>
      </div>

      <div class="dashboard-grid">
        <!-- House information -->
        <div class="card house-info-card">
          <div class="card-header">
            <h2 class="card-title">House Information</h2>
          </div>

          <div class="card-body">
            <div class="house-details">
              <h3 class="house-name">{{ houseStore.currentHouse?.name }}</h3>

              <div class="house-stats">
                <div class="stat-box">
                  <div class="stat-value">{{ houseStore.memberCount }}</div>
                  <div class="stat-label">Members</div>
                </div>

                <div class="stat-box">
                  <div class="stat-value">{{ choreStore.totalChores }}</div>
                  <div class="stat-label">Total Chores</div>
                </div>

                <div class="stat-box">
                  <div class="stat-value">{{ choreStore.completedCount }}</div>
                  <div class="stat-label">Completed</div>
                </div>

                <div class="stat-box">
                  <div class="stat-value">{{ choreStore.pendingCount }}</div>
                  <div class="stat-label">Pending</div>
                </div>
              </div>
            </div>

            <div class="house-actions">
              <button
                v-if="houseStore.isHouseOwner"
                @click="openInviteCodeModal"
                class="btn btn-primary btn-sm"
              >
                <span class="btn-icon">📩</span> Invite Members
              </button>

              <button
                v-if="houseStore.isHouseOwner"
                @click="openManageMembersModal"
                class="btn btn-outline btn-sm"
              >
                <span class="btn-icon">👥</span> Manage Members
              </button>

              <button
                v-if="houseStore.isHouseOwner"
                @click="deleteHouse"
                class="btn btn-error btn-sm"
              >
                <span class="btn-icon">🗑️</span> Delete House
              </button>

              <button v-else @click="leaveHouse" class="btn btn-outline btn-sm">
                <span class="btn-icon">👋</span> Leave House
              </button>
            </div>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="card leaderboard-card">
          <div class="card-header">
            <h2 class="card-title">Leaderboard</h2>
          </div>

          <div class="card-body">
            <div
              v-if="houseStore.sortedMembers.length === 0"
              class="empty-state"
            >
              <p>No users in this house yet.</p>
            </div>

            <ul v-else class="leaderboard-list">
              <li
                v-for="(houseUser, index) in houseStore.sortedMembers"
                :key="houseUser.id"
                class="leaderboard-item"
                :class="{ 'current-user': houseUser.id === userStore.userId }"
              >
                <div class="rank">{{ index + 1 }}</div>
                <div class="user-avatar">
                  <img
                    :src="
                      houseUser.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(houseUser.name)}`
                    "
                    :alt="houseUser.name"
                    class="avatar"
                  />
                </div>
                <div class="user-info">
                  <div class="user-name">{{ houseUser.name }}</div>
                  <div v-if="index === 0" class="user-badge">
                    👑 House Leader
                  </div>
                </div>
                <div class="user-points">{{ houseUser.points || 0 }} pts</div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Unassigned & Pending Chores Section (Independent) -->
        <div
          v-if="choreStore.unassignedAndPendingChores.length"
          class="card unassigned-chores-card"
        >
          <div class="card-header">
            <h2 class="card-title">Unassigned & Pending Chores</h2>
          </div>
          <div class="card-body">
            <div class="chore-list">
              <div
                v-for="chore in choreStore.unassignedAndPendingChores"
                :key="chore.id"
                class="chore-card unassigned"
              >
                <div class="chore-content">
                  <h4 class="chore-title">{{ chore.title }}</h4>
                  <p v-if="chore.description" class="chore-description">
                    {{ chore.description }}
                  </p>
                  <div class="chore-meta">
                    <span v-if="chore.dueDate" class="chore-due">
                      Due: {{ formatDate(chore.dueDate) }}
                      <template v-if="!chore.isCompleted">
                        (<Countdown :target-date="chore.dueDate" />)
                      </template>
                    </span>
                    <span v-if="chore.points" class="chore-points"
                      >{{ chore.points }} pts</span
                    >
                  </div>
                </div>
                <div class="chore-actions">
                  <button
                    class="btn btn-success btn-sm"
                    @click="choreStore.claimChore(chore.id)"
                    :disabled="choreStore.loading"
                  >
                    Claim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- All house chores -->
        <div class="card chores-card">
          <div class="card-header">
            <h2 class="card-title">House Chores</h2>
            <button
              v-if="houseStore.isHouseOwner || userStore.user.isAdmin"
              @click="openCreateChoreModal"
              class="btn btn-primary btn-sm"
            >
              <span class="btn-icon">+</span> Add Chore
            </button>
          </div>

          <div class="card-body">
            <div
              v-if="
                choreStore.chores.length === 0 &&
                !choreStore.houseChoresPagination.loading
              "
              class="empty-state"
            >
              <p>No chores have been created yet.</p>
              <button
                v-if="houseStore.isHouseOwner || userStore.user.isAdmin"
                @click="openCreateChoreModal"
                class="btn btn-primary btn-sm"
              >
                Create your first chore
              </button>
            </div>

            <div
              v-else-if="
                choreStore.houseChoresPagination.loading &&
                !choreStore.chores.length
              "
              class="loading-container"
            >
              <div class="loader"></div>
              <p>Loading chores...</p>
            </div>

            <div v-else class="chore-list">
              <div
                v-for="chore in choreStore.chores"
                :key="chore.id"
                class="chore-card"
                :class="{
                  completed: chore.isCompleted,
                  failed: !chore.isCompleted && chore.attempted,
                  overdue:
                    !chore.isCompleted &&
                    chore.dueDate &&
                    new Date(chore.dueDate).getTime() < Date.now(),
                }"
              >
                <div
                  class="chore-status"
                  :class="{
                    completed: chore.isCompleted,
                    failed: !chore.isCompleted && chore.attempted,
                    overdue:
                      !chore.isCompleted &&
                      chore.dueDate &&
                      new Date(chore.dueDate).getTime() < Date.now(),
                  }"
                >
                  <span class="status-icon">✓</span>
                </div>

                <div class="chore-content">
                  <h3 class="chore-title">{{ chore.title }}</h3>
                  <p v-if="chore.description" class="chore-description">
                    {{ chore.description }}
                  </p>

                  <div class="chore-meta">
                    <span v-if="chore.dueDate" class="chore-due">
                      Due: {{ formatDate(chore.dueDate) }}
                      <template v-if="!chore.isCompleted">
                        (<Countdown :target-date="chore.dueDate" />)
                      </template>
                    </span>
                    <span v-if="chore.points" class="chore-points">
                      {{ chore.points }} pts
                    </span>
                    <span v-if="chore.assignedToId" class="chore-assigned">
                      Assigned to:
                      {{
                        chore.assignedTo?.name ||
                        houseStore.getMemberById(chore.assignedToId)?.name ||
                        "Unknown"
                      }}
                    </span>
                  </div>
                </div>

                <div class="chore-actions">
                  <span
                    v-if="chore.attempted && !chore.isCompleted"
                    class="failed-badge"
                    >Failed</span
                  >
                  <span v-else-if="chore.isCompleted" class="completed-badge"
                    >Completed</span
                  >

                  <RouterLink
                    v-if="houseStore.isHouseOwner || userStore.user.isAdmin"
                    :to="`/chores/${chore.id}/edit`"
                    class="btn btn-sm btn-outline"
                  >
                    Edit
                  </RouterLink>
                </div>
              </div>

              <!-- Pagination controls -->
              <div
                v-if="choreStore.houseChoresPagination.hasNextPage"
                class="pagination-controls"
              >
                <button
                  @click="
                    choreStore.loadMoreHouseChores(houseStore.currentHouse?.id)
                  "
                  class="btn btn-primary btn-sm load-more-btn"
                  :disabled="choreStore.houseChoresPagination.loading"
                >
                  <span
                    v-if="choreStore.houseChoresPagination.loading"
                    class="loader-inline"
                  ></span>
                  <span v-else>Load More Chores</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Your chores -->
        <div class="card your-chores-card">
          <div class="card-header">
            <h2 class="card-title">Your Chores</h2>
          </div>

          <div class="card-body">
            <div
              v-if="
                choreStore.userChores.length === 0 &&
                !choreStore.userChoresPagination.loading
              "
              class="empty-state"
            >
              <p>You don't have any chores assigned.</p>
            </div>

            <div
              v-else-if="
                choreStore.userChoresPagination.loading &&
                !choreStore.userChores.length
              "
              class="loading-container"
            >
              <div class="loader"></div>
              <p>Loading your chores...</p>
            </div>

            <div v-else class="chore-list">
              <div
                v-for="chore in choreStore.userChores"
                :key="chore.id"
                class="chore-card"
                :class="{
                  completed: chore.isCompleted,
                  failed: !chore.isCompleted && chore.attempted,
                  overdue:
                    !chore.isCompleted &&
                    chore.dueDate &&
                    new Date(chore.dueDate).getTime() < Date.now(),
                }"
              >
                <div
                  class="chore-status"
                  :class="{
                    completed: chore.isCompleted,
                    failed: !chore.isCompleted && chore.attempted,
                    overdue:
                      !chore.isCompleted &&
                      chore.dueDate &&
                      new Date(chore.dueDate).getTime() < Date.now(),
                  }"
                >
                  <span class="status-icon">✓</span>
                </div>

                <div class="chore-content">
                  <h3 class="chore-title">{{ chore.title }}</h3>
                  <p v-if="chore.description" class="chore-description">
                    {{ chore.description }}
                  </p>

                  <div class="chore-meta">
                    <span v-if="chore.dueDate" class="chore-due">
                      Due: {{ formatDate(chore.dueDate) }}
                    </span>
                    <span v-if="chore.points" class="chore-points">
                      {{ chore.points }} pts
                    </span>
                  </div>
                </div>

                <div class="chore-actions">
                  <ChoreCompletionForm :chore-id="chore.id" :chore="chore" />

                  <span
                    v-if="chore.isCompleted && chore.attempted"
                    class="completed-badge"
                    >Completed</span
                  >
                  <span
                    v-else-if="!chore.isCompleted && chore.attempted"
                    class="failed-badge"
                    >Not Verified</span
                  >
                </div>
              </div>

              <!-- Pagination controls -->
              <div
                v-if="choreStore.userChoresPagination.hasNextPage"
                class="pagination-controls"
              >
                <button
                  @click="
                    choreStore.loadMoreUserChores(
                      houseStore.currentHouse?.id,
                      userStore.userId
                    )
                  "
                  class="btn btn-primary btn-sm load-more-btn"
                  :disabled="choreStore.userChoresPagination.loading"
                >
                  <span
                    v-if="choreStore.userChoresPagination.loading"
                    class="loader-inline"
                  ></span>
                  <span v-else>Load More Chores</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Chore Modal -->
    <div v-if="showCreateChoreModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Add New Chore</h2>
          <button @click="closeCreateChoreModal" class="close-button">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <CreateChoreForm
            @created="
              () => {
                loadDashboard();
                closeCreateChoreModal();
              }
            "
          />
        </div>
      </div>
    </div>

    <!-- Manage Members Modal -->
    <div v-if="showManageMembersModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Manage Members</h2>
          <button @click="closeManageMembersModal" class="close-button">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <ManageMembersModal />
        </div>
      </div>
    </div>

    <!-- Invite Code Modal -->
    <div v-if="showInviteCodeModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Invite Members</h2>
          <button @click="closeInviteCodeModal" class="close-button">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <InviteCodeGenerator />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Generated by GitHub Copilot */
.dashboard-container {
  min-height: calc(100vh - 180px); /* Adjust for header and footer */
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-text {
  margin-top: var(--spacing-md);
  color: var(--gray);
}

.dashboard-header {
  margin-bottom: var(--spacing-xl);
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xs);
}

.user-points-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, var(--primary) 0%, var(--success) 100%);
  color: var(--white);
  border-radius: var(--radius-lg);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.user-points-display:hover {
  transform: translateY(-2px);
}

.points-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.points-value {
  font-size: var(--font-size-md);
  font-weight: 600;
  transition: all 0.3s ease;
}

.points-value.updated {
  animation: pointsUpdate 0.5s ease;
}

@keyframes pointsUpdate {
  0% {
    transform: scale(1);
    color: var(--white);
  }
  50% {
    transform: scale(1.1);
    color: var(--warning);
  }
  100% {
    transform: scale(1);
    color: var(--white);
  }
}

.dashboard-title {
  margin-bottom: 0;
  flex: 1;
}

.dashboard-subtitle {
  color: var(--gray);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

/* Card layouts */
.house-info-card {
  grid-column: span 2;
}

.chores-card {
  grid-column: span 2;
}

.your-chores-card {
  grid-column: span 2;
}

/* House info styles */
.house-details {
  margin-bottom: var(--spacing-lg);
}

.house-name {
  font-size: var(--font-size-2xl);
  color: var(--primary);
  margin-bottom: var(--spacing-md);
}

.house-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.stat-box {
  flex: 1;
  min-width: 100px;
  background-color: var(--light);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: bold;
  color: var(--primary);
}

.stat-label {
  color: var(--gray);
  font-size: var(--font-size-sm);
}

.house-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

/* Leaderboard styles */
.leaderboard-list {
  list-style: none;
  padding: 0;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-md);
  background-color: var(--light);
  transition: transform var(--transition-fast);
}

.leaderboard-item:hover {
  transform: translateX(5px);
}

.leaderboard-item.current-user {
  background-color: rgba(67, 97, 238, 0.1);
}

.rank {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary);
  color: var(--white);
  border-radius: 50%;
  font-weight: bold;
  margin-right: var(--spacing-md);
}

.user-avatar {
  margin-right: var(--spacing-md);
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
}

.user-badge {
  font-size: var(--font-size-xs);
  color: var(--secondary);
}

.user-points {
  font-weight: bold;
  color: var(--primary-dark);
}

/* Chore styles */
.chore-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.chore-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--white);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--gray-light);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.chore-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.chore-card.completed {
  border-left-color: var(--success);
  background-color: rgba(16, 185, 129, 0.05);
}

.chore-card.failed {
  border-left-color: var(--error);
  background-color: rgba(239, 68, 68, 0.05);
}

.chore-card.overdue {
  border-left-color: var(--overdue);
  background-color: rgba(248, 113, 113, 0.05);
}

.chore-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--gray-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
}

.chore-status.completed {
  background-color: var(--success);
  border-color: var(--success);
}

.chore-status.failed {
  background-color: var(--error);
  border-color: var(--error);
}

.chore-status.overdue {
  background-color: var(--overdue);
  border-color: var(--overdue);
}

.status-icon {
  display: none;
  color: var(--white);
  font-size: var(--font-size-sm);
}

.chore-status.completed .status-icon {
  display: inline;
}

.chore-content {
  flex: 1;
}

.chore-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
}

.chore-description {
  color: var(--gray);
  margin-bottom: var(--spacing-xs);
}

.chore-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.chore-due {
  color: var(--gray-dark);
}

.chore-points {
  color: var(--primary);
  font-weight: 500;
}

.chore-assigned {
  color: var(--gray);
}

.chore-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-left: var(--spacing-md);
  min-width: 200px;
  max-width: 300px;
  flex-shrink: 0;
}

.completed-badge {
  display: inline-block;
  text-align: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--success);
  color: var(--white);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.failed-badge {
  display: inline-block;
  text-align: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--error);
  color: var(--white);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

/* Pagination styles */
.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

.load-more-btn {
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Form styles */
.welcome-card {
  max-width: 600px;
  margin: 0 auto;
}

.welcome-title {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-md);
  color: var(--primary);
}

.welcome-subtitle {
  color: var(--gray);
  margin-bottom: var(--spacing-xl);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.form-container {
  max-width: 400px;
  margin: 0 auto;
}

.house-form {
  animation: fadeIn var(--transition-normal);
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--white);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--light);
}

.modal-title {
  font-size: var(--font-size-xl);
  color: var(--dark);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--gray);
}

.modal-body {
  padding: var(--spacing-lg);
}

/* Button specific styles */
.btn-error {
  background-color: var(--error);
  color: var(--white);
}

.btn-error:hover {
  background-color: #e03131;
}

.btn-success {
  background-color: var(--success);
  color: var(--white);
}

.btn-success:hover {
  background-color: #0ca678;
}

/* Responsive styles */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .house-info-card,
  .chores-card,
  .your-chores-card {
    grid-column: span 1;
  }

  .house-stats {
    flex-wrap: wrap;
  }

  .stat-box {
    min-width: 80px;
  }

  .action-buttons {
    flex-direction: column;
  }

  /* --- Chore card mobile improvements --- */
  .chore-card {
    flex-direction: column;
    align-items: stretch;
    padding: var(--spacing-md) var(--spacing-sm);
    min-width: 0;
    word-break: break-word;
    gap: var(--spacing-sm);
  }
  .chore-status {
    margin-right: 0;
    margin-bottom: var(--spacing-xs);
    align-self: flex-start;
  }
  .chore-content {
    width: 100%;
    min-width: 0;
  }
  .chore-actions {
    margin-left: 0;
    min-width: 0;
    max-width: 100%;
    width: 100%;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  .completed-badge,
  .failed-badge {
    width: 100%;
    box-sizing: border-box;
    margin-top: var(--spacing-xs);
  }
}
</style>

<style scoped></style>
/* Unassigned chores section styles */ .unassigned-chores-card { margin-bottom:
var(--spacing-lg); } .unassigned-chores-card .card-title { font-size:
var(--font-size-lg); color: var(--primary); margin-bottom: var(--spacing-md); }
.chore-card.unassigned { border-left: 4px solid var(--warning); background:
#fffbe6; }

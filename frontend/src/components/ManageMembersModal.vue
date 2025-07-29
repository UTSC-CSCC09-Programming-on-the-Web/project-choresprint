<template>
  <div>
    <table class="members-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Admin</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in houseStore.houseMembers" :key="member.id">
          <td>{{ member.name }}</td>
          <td>{{ member.email }}</td>
          <td>
            <span v-if="member.id === houseStore.currentHouse.createdById"
              >Owner</span
            >
            <span v-else>Member</span>
          </td>
          <td>
            <template v-if="member.id !== houseStore.currentHouse.createdById">
              <input
                type="checkbox"
                :checked="member.isAdmin"
                :disabled="updatingId === member.id"
                @change="toggleAdmin(member)"
              />
            </template>
            <template v-else>
              <span>—</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, watch, toRefs, computed } from "vue";
import { useUserStore } from "../stores/user";
import { useHouseStore } from "../stores/house";

const userStore = useUserStore();
const houseStore = useHouseStore();
const updatingId = ref(null);
const error = ref("");

async function toggleAdmin(member) {
  updatingId.value = member.id;
  error.value = "";
  try {
    await userStore.updateUser(member.id, {
      isAdmin: !member.isAdmin,
    });
  } catch (e) {
    error.value = "Failed to update admin status.";
  } finally {
    updatingId.value = null;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  max-width: 500px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
}
.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}
.modal-body {
  padding: 1.5rem;
}
.members-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.members-table th,
.members-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.members-table th {
  background: #f8f9fa;
  font-weight: 500;
}
.members-table tr:nth-child(even) {
  background: #f6f6f6;
}
.error-message {
  color: #e03131;
  margin-top: 0.5rem;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "../api/";
import CreateChoreForm from "../components/CreateChoreForm.vue";
import CreateHouseForm from "../components/CreateHouseForm.vue";
import JoinHouseForm from "../components/JoinHouseForm.vue";
import InviteCodeGenerator from "../components/InviteCodeGenerator.vue";
import { RouterLink } from "vue-router";

// State
const user = ref(null);
const userHouses = ref([]);
const currentHouse = ref(null);
const houseUsers = ref([]);
const houseChores = ref([]);
const userChores = ref([]);
const showCreateJoin = ref(false);
const showCreateHouseForm = ref(false);
const showJoinHouseForm = ref(false);

// Fetch user and their houses
async function loadDashboard() {
  try {
    const { data: me } = await api.get("/auth/me");
    user.value = me;
    const { data: houses } = await api.get(`/users/${me.id}/houses`);
    userHouses.value = houses;

    if (houses.length === 0) {
      showCreateJoin.value = true;
    } else {
      currentHouse.value = houses[0].house;
      showCreateJoin.value = false;

      const { data: users } = await api.get(
        `/houses/${currentHouse.value.id}/users`
      );
      const { data: userChoresRes } = await api.get(
        `/houses/${currentHouse.value.id}/chores?assignedTo=${me.id}`
      );

      const { data: houseChoresRes } = await api.get(
        `/houses/${currentHouse.value.id}/chores`
      );

      houseUsers.value = users.data;
      houseChores.value = houseChoresRes.data;
      userChores.value = userChoresRes.data;
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

onMounted(() => {
  loadDashboard();
});

// Handlers for showing forms
function openCreateHouse() {
  showCreateHouseForm.value = true;
  showJoinHouseForm.value = false;
}

function openJoinHouse() {
  showJoinHouseForm.value = true;
  showCreateHouseForm.value = false;
}

function deleteHouse() {
  if (confirm("Are you sure you want to delete this house?")) {
    api
      .delete(`/houses/${currentHouse.value.id}`)
      .then(() => {
        loadDashboard();
      })
      .catch((error) => {
        console.error("Error deleting house:", error);
      });
  }
}

function leaveHouse() {
  if (confirm("Are you sure you want to leave this house?")) {
    api
      .delete(`/houses/${currentHouse.value.id}/leave`)
      .then(() => {
        loadDashboard();
      })
      .catch((error) => {
        console.error("Error leaving house:", error);
      });
  }
}
</script>

<template>
  <div>
    <div v-if="showCreateJoin">
      <p>You are not part of any house yet.</p>
      <button @click="openCreateHouse">Create House</button>
      <button @click="openJoinHouse">Join House</button>

      <CreateHouseForm v-if="showCreateHouseForm" @created="loadDashboard" />
      <JoinHouseForm v-if="showJoinHouseForm" @joined="loadDashboard" />
    </div>

    <div v-else>
      <h2>House: {{ currentHouse?.name }}</h2>

      <h3>Chores</h3>
      <ul>
        <li v-for="chore in houseChores" :key="chore.id">
          {{ chore.title }} - {{ chore.isCompleted ? "Done" : "Pending" }}
          <RouterLink
            v-if="user?.id === currentHouse?.createdById"
            :to="`/chores/${chore.id}/edit`"
            >Edit</RouterLink
          >
        </li>
      </ul>

      <h3>Your Chores</h3>
      <ul>
        <li v-for="chore in userChores" :key="chore.id">
          {{ chore.title }} - {{ chore.isCompleted ? "Done" : "Pending" }}
        </li>
      </ul>

      <CreateChoreForm
        v-if="user?.id === currentHouse?.createdById"
        :house-id="currentHouse?.id"
      />

      <h3>Leaderboard</h3>
      <ul>
        <li v-for="user in houseUsers" :key="user.id">
          {{ user.name }} - {{ user.points }} points
        </li>
      </ul>
      <div v-if="user?.id === currentHouse?.createdById">
        <InviteCodeGenerator :house-id="currentHouse?.id" />
        <button @click="deleteHouse">Delete House</button>
      </div>
      <div v-else>
        <button @click="leaveHouse">Leave House</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "../api/";

// State
const userHouses = ref([]);
const currentHouse = ref(null);
const houseUsers = ref([]);
const userChores = ref([]);
const showCreateJoin = ref(false);
const showCreateHouseForm = ref(false);
const showJoinHouseForm = ref(false);

// Fetch user and their houses
async function loadDashboard() {
  try {
    const { data: me } = await api.get("/auth/me");
    console.log("Current user:", me);
    const { data: houses } = await api.get(`/users/${me.id}/houses`);
    userHouses.value = houses;

    if (houses.length === 0) {
      showCreateJoin.value = true;
    } else {
      currentHouse.value = houses[0].house;
      showCreateJoin.value = false;

      //   const { data: users } = await api.get(
      //     `/houses/${currentHouse.value.id}/users`
      //   );
      //   const { data: chores } = await api.get(
      //     `/houses/${currentHouse.value.houseId}/chores?assignedTo=${me.id}`
      //   );

      //   houseUsers.value = users;
      //   userChores.value = chores;
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

      <!-- <h3>Your Chores</h3>
      <ul>
        <li v-for="chore in userChores" :key="chore.id">
          {{ chore.title }} - {{ chore.isCompleted ? "Done" : "Pending" }}
        </li>
      </ul>

      <h3>Leaderboard</h3>
      <ul>
        <li v-for="user in houseUsers" :key="user.id">
          {{ user.name }} - {{ user.points }} points
        </li>
      </ul> -->
    </div>
  </div>
</template>

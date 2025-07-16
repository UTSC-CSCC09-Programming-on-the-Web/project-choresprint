import { defineStore } from "pinia";
import { useUserStore } from "./user";
import houseApiService from "../api/house";

interface HouseUser {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  points?: number;
}

interface House {
  id: number;
  name: string;
  createdById: number;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export const useHouseStore = defineStore("house", {
  state: () => ({
    currentHouse: null as House | null,
    houseMembers: [] as HouseUser[],
    loading: false,
    error: null as string | null,
    initialized: false,
    showCreateJoin: false,
  }),

  getters: {
    isHouseOwner: (state) => {
      const userStore = useUserStore();
      return state.currentHouse?.createdById === userStore.userId;
    },

    memberCount: (state) => state.houseMembers.length,

    sortedMembers: (state) => {
      return [...state.houseMembers].sort(
        (a, b) => (b.points || 0) - (a.points || 0)
      );
    },

    getMemberById: (state) => (id: number) => {
      return state.houseMembers.find((member) => member.id === id);
    },

    houseId: (state) => state.currentHouse?.id,
  },

  actions: {
    async initialize(userId: number) {
      if (this.initialized) return;

      this.loading = true;
      this.error = null;

      try {
        await this.fetchUserHouse(userId);
        this.initialized = true;
      } catch (error) {
        // Not part of a house, show create/join UI
        this.currentHouse = null;
        this.showCreateJoin = true;
        this.initialized = true;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserHouse(userId: number) {
      this.loading = true;
      this.error = null;
      const userStore = useUserStore();

      if (!userStore.user || userStore.user.id !== userId) {
        this.error = "User not found";
        this.showCreateJoin = true;
        this.loading = false;
        return null;
      }

      if (!userStore.user.houseId) {
        this.currentHouse = null;
        this.showCreateJoin = true;
        this.loading = false;
        return null;
      }

      try {
        // const { data } = await api.get(`/houses/${userStore.user?.houseId}`);
        const data = await houseApiService.getHouse(userStore.user.houseId);

        this.currentHouse = data;
        this.showCreateJoin = false;

        if (this.currentHouse?.id) {
          await this.fetchHouseMembers(this.currentHouse.id);
        }

        return this.currentHouse;
      } catch (error) {
        this.error = "Failed to fetch house";
        this.showCreateJoin = true;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchHouseMembers(houseId: number) {
      this.loading = true;
      this.error = null;

      try {
        // const { data } = await api.get(`/houses/${houseId}/users`);
        const data = await houseApiService.getHouseMembers(houseId);
        this.houseMembers = data?.users || [];
        return data?.users;
      } catch (error) {
        this.error = "Failed to fetch house members";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createHouse(houseName: string) {
      this.loading = true;
      this.error = null;

      try {
        // const { data } = await api.post("/houses", { name: houseName });
        const data = await houseApiService.createHouse({ name: houseName });
        this.currentHouse = data;
        this.showCreateJoin = false;

        const userStore = useUserStore();
        if (userStore.user) {
          userStore.user.houseId = data.id;
        }

        // Initialize with the current user as first member
        this.houseMembers = [userStore.user as HouseUser];

        return data;
      } catch (error) {
        this.error = "Failed to create house";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async joinHouse(inviteCode: string) {
      this.loading = true;
      this.error = null;

      try {
        // const { data } = await api.post(
        //   `/houses/invitations/${inviteCode}/use`
        // );

        const data = await houseApiService.joinHouse(inviteCode);

        const userStore = useUserStore();
        if (userStore.user) {
          await this.fetchUserHouse(userStore.user.id);
        }

        return data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to join house";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteHouse() {
      if (!this.currentHouse?.id) return;

      this.loading = true;
      this.error = null;

      try {
        // await api.delete(`/houses/${this.currentHouse.id}`);

        await houseApiService.deleteHouse(this.currentHouse.id);

        // Update user's houseId to null
        const userStore = useUserStore();
        if (userStore.user) {
          userStore.user.houseId = null;
        }

        this.currentHouse = null;
        this.houseMembers = [];
        this.showCreateJoin = true;

        return true;
      } catch (error) {
        this.error = "Failed to delete house";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async leaveHouse() {
      if (!this.currentHouse?.id) return;

      this.loading = true;
      this.error = null;

      try {
        // await api.delete(`/houses/${this.currentHouse.id}/leave`);

        await houseApiService.leaveHouse(this.currentHouse.id);

        // Update user's houseId to null
        const userStore = useUserStore();
        if (userStore.user) {
          userStore.user.houseId = null;
        }

        this.currentHouse = null;
        this.houseMembers = [];
        this.showCreateJoin = true;

        return true;
      } catch (error) {
        this.error = "Failed to leave house";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async generateInvitation() {
      if (!this.currentHouse?.id) return;

      this.loading = true;
      this.error = null;

      try {
        // const { data } = await api.post(
        // `/houses/${this.currentHouse.id}/invitations`
        // );
        const code = await houseApiService.generateInvitationCode(
          this.currentHouse.id
        );
        return code;
      } catch (error) {
        this.error = "Failed to generate invitation code";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    updateMemberPoints(memberId: number, points: number) {
      const index = this.houseMembers.findIndex(
        (member) => member.id === memberId
      );
      if (index !== -1) {
        this.houseMembers[index].points =
          (this.houseMembers[index].points || 0) + points;
      }
    },

    resetState() {
      this.currentHouse = null;
      this.houseMembers = [];
      this.loading = false;
      this.error = null;
      this.initialized = false;
      this.showCreateJoin = false;
    },
  },
});

import { defineStore } from "pinia";
import userApiService from "../api/user";

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  houseId?: number | null;
  points?: number;
  subscriptionRequired?: boolean;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
    initialized: false,
  }),

  getters: {
    // User profile getters
    userName: (state) => state.user?.name || "",
    userEmail: (state) => state.user?.email || "",
    userAvatar: (state) => {
      if (!state.user?.name) return "";
      return (
        state.user?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(state.user.name)}`
      );
    },
    userId: (state) => state.user?.id,
    userHouseId: (state) => state.user?.houseId,
    userPoints: (state) => state.user?.points || 0,
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
  },

  actions: {
    async initialize() {
      if (this.initialized) return;

      this.loading = true;
      this.error = null;

      try {
        await this.fetchCurrentUser();
        this.initialized = true;
      } catch (error) {
        // If fetch fails, user is not authenticated
        this.user = null;
        this.isAuthenticated = false;
        this.initialized = true;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      this.loading = true;
      this.error = null;

      try {
        // const { data } = await api.get('/auth/me');
        const data = await userApiService.getUser();
        this.user = data;
        this.isAuthenticated = true;
        return data;
      } catch (error) {
        this.error = "Failed to fetch user profile";
        this.user = null;
        this.isAuthenticated = false;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      this.error = null;

      try {
        // await api.post('/auth/logout');
        await userApiService.logout();
        this.clearUser();
        return true;
      } catch (error) {
        this.error = "Failed to logout";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearUser() {
      this.user = null;
      this.isAuthenticated = false;
      this.initialized = false;
    },

    updateUserPoints(points: number) {
      if (this.user) {
        this.user.points = (this.user.points || 0) + points;
      }
    },

    // Set user points directly (for backend sync)
    setUserPoints(points: number) {
      if (this.user) {
        this.user.points = points;
      }
    },
  },
});

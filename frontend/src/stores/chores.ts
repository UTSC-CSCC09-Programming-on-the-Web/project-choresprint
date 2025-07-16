import { defineStore } from "pinia";
// import { api } from "../api";
import { useHouseStore } from "./house";
import { useUserStore } from "./user";
import choresApiService from "../api/chores";

interface Chore {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  assignedToId?: number | null;
  assignedTo?: {
    id: number;
    name: string;
  };
  houseId: number;
  points: number;
  referencePhotoUrl?: string;
  photoUrl?: string;
  verified: boolean;
  attempted: boolean;
  explanation?: string;
}

interface PaginationState {
  nextCursor: number | null;
  hasNextPage: boolean;
  totalCount: number;
  limit: number;
  loading: boolean;
}

export const useChoreStore = defineStore("chores", {
  state: () => ({
    chores: [] as Chore[],
    userChores: [] as Chore[],
    error: null as string | null,
    loading: false,

    houseChoresPagination: {
      nextCursor: null,
      hasNextPage: false,
      totalCount: 0,
      limit: 10,
      loading: false,
    } as PaginationState,

    userChoresPagination: {
      nextCursor: null,
      hasNextPage: false,
      totalCount: 0,
      limit: 10,
      loading: false,
    } as PaginationState,
  }),

  getters: {
    totalChores: (state) =>
      state.houseChoresPagination.totalCount || state.chores.length,

    completedCount: (state) => {
      return state.chores.filter((chore) => chore.isCompleted).length;
    },

    pendingCount(state) {
      if (state.houseChoresPagination.totalCount) {
        return (
          state.houseChoresPagination.totalCount -
          state.chores.filter((chore) => chore.isCompleted).length
        );
      }
      return state.chores.filter((chore) => !chore.isCompleted).length;
    },

    getChoreById: (state) => (id: number) => {
      return (
        state.chores.find((c) => c.id === id) ||
        state.userChores.find((c) => c.id === id)
      );
    },
  },

  actions: {
    // Fetch all chores for a house with pagination
    async fetchChores(houseId: number, refresh = false) {
      if (!houseId || (this.houseChoresPagination.loading && !refresh)) return;

      this.houseChoresPagination.loading = true;
      this.error = null;

      try {
        let url = `/houses/${houseId}/chores?limit=${this.houseChoresPagination.limit}`;

        // If not refreshing and we have a cursor, use it for pagination
        if (!refresh && this.houseChoresPagination.nextCursor) {
          url += `&cursor=${this.houseChoresPagination.nextCursor}`;
        } else if (refresh) {
          // If refreshing, reset pagination and chores array
          this.chores = [];
          this.houseChoresPagination.nextCursor = null;
        }

        // const { data: response } = await api.get(url);
        const response = await choresApiService.getChores(houseId, {
          limit: this.houseChoresPagination.limit,
          cursor: Number(this.houseChoresPagination.nextCursor),
        });

        // If this is the first load or a refresh, replace the array
        // Otherwise append for "load more" functionality
        if (!this.houseChoresPagination.nextCursor || refresh) {
          this.chores = response?.data || [];
        } else {
          this.chores = [...this.chores, ...(response?.data || [])];
        }

        // Update pagination state
        this.houseChoresPagination = {
          ...this.houseChoresPagination,
          nextCursor: response?.pagination?.nextCursor || null,
          hasNextPage: response?.pagination?.hasNextPage || false,
          totalCount:
            response?.pagination?.totalCount ||
            this.houseChoresPagination.totalCount ||
            0,
        };

        return response?.data;
      } catch (error) {
        console.error("Error fetching chores:", error);
        this.error = "Failed to load chores";
        throw error;
      } finally {
        this.houseChoresPagination.loading = false;
      }
    },

    // Load more house chores for pagination
    async loadMoreHouseChores(houseId: number) {
      if (!this.houseChoresPagination.hasNextPage || !houseId) return;
      return this.fetchChores(houseId);
    },

    // Fetch chores assigned to a specific user
    async fetchUserChores(houseId: number, userId: number, refresh = false) {
      if (
        !houseId ||
        !userId ||
        (this.userChoresPagination.loading && !refresh)
      )
        return;

      this.userChoresPagination.loading = true;
      this.error = null;

      try {
        let url = `/houses/${houseId}/chores?assignedTo=${userId}&limit=${this.userChoresPagination.limit}`;

        // If not refreshing and we have a cursor, use it for pagination
        if (!refresh && this.userChoresPagination.nextCursor) {
          url += `&cursor=${this.userChoresPagination.nextCursor}`;
        } else if (refresh) {
          // If refreshing, reset pagination and userChores array
          this.userChores = [];
          this.userChoresPagination.nextCursor = null;
        }

        // const { data: response } = await api.get(url);
        const response = await choresApiService.getUserChores(houseId, {
          assignedTo: userId,
          limit: this.userChoresPagination.limit,
          cursor: Number(this.userChoresPagination.nextCursor),
        });

        // If this is the first load or a refresh, replace the array
        // Otherwise append for "load more" functionality
        if (!this.userChoresPagination.nextCursor || refresh) {
          this.userChores = response?.data || [];
        } else {
          this.userChores = [...this.userChores, ...(response?.data || [])];
        }

        // Update pagination state
        this.userChoresPagination = {
          ...this.userChoresPagination,
          nextCursor: response?.pagination?.nextCursor || null,
          hasNextPage: response?.pagination?.hasNextPage || false,
          totalCount:
            response?.pagination?.totalCount ||
            this.userChoresPagination.totalCount ||
            0,
        };

        return response?.data;
      } catch (error) {
        console.error("Error fetching user chores:", error);
        this.error = "Failed to load your chores";
        throw error;
      } finally {
        this.userChoresPagination.loading = false;
      }
    },

    // Load more user chores for pagination
    async loadMoreUserChores(houseId: number, userId: number) {
      if (!this.userChoresPagination.hasNextPage || !houseId || !userId) return;
      return this.fetchUserChores(houseId, userId);
    },

    // Create a new chore
    async createChore(choreData: FormData) {
      this.loading = true;
      this.error = null;

      try {
        // const { data: newChore } = await api.post("/chores", choreData, {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        const newChore = await choresApiService.createChore(choreData);

        // Add to both arrays if it matches the filters
        this.chores.unshift(newChore);

        if (newChore.assignedToId) {
          const userStore = useUserStore();
          if (userStore.userId === newChore.assignedToId) {
            this.userChores.unshift(newChore);
          }
        }

        // Update total count in pagination state
        this.houseChoresPagination.totalCount += 1;

        return newChore;
      } catch (error) {
        this.error = "Failed to create chore";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Update an existing chore
    async updateChore(choreId: number, choreData: Partial<Chore>) {
      this.loading = true;
      this.error = null;

      try {
        // const { data: updatedChore } = await api.patch(
        //   `/chores/${choreId}`,
        //   choreData
        // );

        const updatedChore = await choresApiService.updateChore(
          choreId,
          choreData
        );

        // Update in chores array
        const choreIndex = this.chores.findIndex((c) => c.id === choreId);
        if (choreIndex !== -1) {
          const updatedChoreInArray = {
            ...this.chores[choreIndex],
            ...updatedChore,
          };
          this.chores.splice(choreIndex, 1, updatedChoreInArray);
        }

        // Update in userChores array
        const userChoreIndex = this.userChores.findIndex(
          (c) => c.id === choreId
        );
        if (userChoreIndex !== -1) {
          const updatedUserChoreInArray = {
            ...this.userChores[userChoreIndex],
            ...updatedChore,
          };
          this.userChores.splice(userChoreIndex, 1, updatedUserChoreInArray);
        }

        return updatedChore;
      } catch (error) {
        this.error = "Failed to update chore";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Delete a chore
    async deleteChore(choreId: number) {
      this.loading = true;
      this.error = null;

      try {
        // await api.delete(`/chores/${choreId}`);
        await choresApiService.deleteChore(choreId);

        // Remove from chores array
        this.chores = this.chores.filter((c) => c.id !== choreId);

        // Remove from userChores array
        this.userChores = this.userChores.filter((c) => c.id !== choreId);

        // Update total count in pagination state
        if (this.houseChoresPagination.totalCount > 0) {
          this.houseChoresPagination.totalCount -= 1;
        }

        return true;
      } catch (error) {
        this.error = "Failed to delete chore";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Mark a chore as complete and update user points
    async markChoreComplete(choreId: number) {
      const chore = this.getChoreById(choreId);
      if (!chore) return;

      this.loading = true;
      this.error = null;

      try {
        // const { data: updatedChore } = await api.patch(`/chores/${choreId}`, {
        //   isCompleted: true,
        // });
        const updatedChore = await choresApiService.updateChore(choreId, {
          isCompleted: true,
          title: chore.title, // Ensure title is preserved
          description: chore.description, // Ensure description is preserved
          dueDate: chore.dueDate, // Ensure dueDate is preserved
          assignedToId: chore.assignedToId, // Ensure assignedToId is preserved
          points: chore.points, // Ensure points are preserved
        });

        // Update in chores array
        const choreIndex = this.chores.findIndex((c) => c.id === choreId);
        if (choreIndex !== -1) {
          const updatedChoreInArray = {
            ...this.chores[choreIndex],
            isCompleted: true,
          };
          this.chores.splice(choreIndex, 1, updatedChoreInArray);
        }

        // Update in userChores array
        const userChoreIndex = this.userChores.findIndex(
          (c) => c.id === choreId
        );
        if (userChoreIndex !== -1) {
          const updatedUserChoreInArray = {
            ...this.userChores[userChoreIndex],
            isCompleted: true,
          };
          this.userChores.splice(userChoreIndex, 1, updatedUserChoreInArray);
        }

        // Update points for the assigned user
        if (chore.assignedToId) {
          const houseStore = useHouseStore();
          houseStore.updateMemberPoints(chore.assignedToId, chore.points || 0);
        }

        return updatedChore;
      } catch (error) {
        console.error("Error marking chore as complete:", error);
        this.error = "Failed to complete chore";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async uploadCompletionPhoto(choreId: number, formData: FormData) {
      this.loading = true;
      this.error = null;

      try {
        await choresApiService.uploadCompletionPhoto(choreId, formData);
      } catch (error) {
        console.error("Error uploading completion photo:", error);
        this.error = "Failed to upload completion photo";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Reset all state (used for logout)
    clearChores() {
      this.chores = [];
      this.userChores = [];
      this.error = null;
      this.houseChoresPagination = {
        nextCursor: null,
        hasNextPage: false,
        totalCount: 0,
        limit: 10,
        loading: false,
      };
      this.userChoresPagination = {
        nextCursor: null,
        hasNextPage: false,
        totalCount: 0,
        limit: 10,
        loading: false,
      };
    },

    // Add these methods to your existing chore store

    // Inside the actions object:
    async fetchChoreById(choreId: number) {
      this.loading = true;
      this.error = null;

      try {
        // const { data: chore } = await api.get(`/chores/${choreId}`);
        const chore = await choresApiService.getChore(choreId);

        // Update or add this chore to the chores array if it's not there
        const existingIndex = this.chores.findIndex((c) => c.id === choreId);
        if (existingIndex >= 0) {
          this.chores.splice(existingIndex, 1, chore);
        } else {
          this.chores.push(chore);
        }

        return chore;
      } catch (error: any) {
        this.error = error.response?.data?.error || "Failed to fetch chore";
        throw new Error(this.error || "");
      } finally {
        this.loading = false;
      }
    },

    // Refresh a specific chore (for real-time updates)
    async refreshChore(choreId: number) {
      try {
        const updatedChore = await choresApiService.getChore(choreId);

        // Update in chores array
        const choreIndex = this.chores.findIndex((c) => c.id === choreId);
        if (choreIndex !== -1) {
          this.chores.splice(choreIndex, 1, updatedChore);
        }

        // Update in userChores array
        const userChoreIndex = this.userChores.findIndex(
          (c) => c.id === choreId
        );
        if (userChoreIndex !== -1) {
          this.userChores.splice(userChoreIndex, 1, updatedChore);
        }

        return updatedChore;
      } catch (error) {
        console.error("Error refreshing chore:", error);
        throw error;
      }
    },

    // Update chore verification status (used for real-time updates)
    updateChoreVerificationStatus(
      choreId: number,
      verified: boolean,
      explanation?: string
    ) {
      // Update in chores array
      const choreIndex = this.chores.findIndex((c) => c.id === choreId);
      if (choreIndex !== -1) {
        // Create a completely new object to ensure reactivity
        const updatedChore = {
          ...this.chores[choreIndex],
          verified,
          isCompleted: verified,
          attempted: true,
          explanation: explanation || this.chores[choreIndex].explanation,
        };

        // Replace the entire array element to trigger reactivity
        this.chores.splice(choreIndex, 1, updatedChore);
      }

      // Update in userChores array
      const userChoreIndex = this.userChores.findIndex((c) => c.id === choreId);
      if (userChoreIndex !== -1) {
        // Create a completely new object to ensure reactivity
        const updatedUserChore = {
          ...this.userChores[userChoreIndex],
          verified,
          isCompleted: verified,
          attempted: true,
          explanation:
            explanation || this.userChores[userChoreIndex].explanation,
        };

        // Replace the entire array element to trigger reactivity
        this.userChores.splice(userChoreIndex, 1, updatedUserChore);
      }
    },
  },
});

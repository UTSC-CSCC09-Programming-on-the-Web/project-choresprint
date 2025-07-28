import { api } from ".";

interface UserApiService {
  getUser: () => Promise<any>;
  logout: () => Promise<void>;
  getById: (id: number) => Promise<any>;
  updatePreferences: (prefs: { weeklyDigest: boolean }) => Promise<any>;
  deleteAccount: () => Promise<void>;
  updateUser: (id: number, data: any) => Promise<any>;
}

let userApiService: UserApiService = {} as UserApiService;

userApiService.getUser = async function () {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
userApiService.logout = async function () {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Fetch user by ID
userApiService.getById = async function (id: number) {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Update user preferences
userApiService.updatePreferences = async function (prefs: {
  weeklyDigest: boolean;
}) {
  try {
    const response = await api.patch("/users/me/preferences", prefs);
    return response.data;
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};

// Delete user account
userApiService.deleteAccount = async function () {
  try {
    await api.delete("/users/me");
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};


userApiService.updateUser = async function (id: number, data: any) {
  try {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export default userApiService;

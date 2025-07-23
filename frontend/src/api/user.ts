import { api } from ".";

interface UserApiService {
  getUser: () => Promise<any>;
  logout: () => Promise<void>;
  getById: (id: number) => Promise<any>;
  updatePreferences: (prefs: { weeklyDigest: boolean }) => Promise<any>;
  deleteAccount: (id: number) => Promise<void>;
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

export default userApiService;

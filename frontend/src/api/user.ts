import { api } from ".";

interface UserApiService {
  getUser: () => Promise<any>;
  logout: () => Promise<void>;
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

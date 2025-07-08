import { api } from ".";

interface HouseApiService {
  generateInvitationCode: (houseId: number) => Promise<any>;
  getHouse: (houseId: number) => Promise<any>;
  createHouse: (houseData: any) => Promise<any>;
  getHouseMembers: (houseId: number) => Promise<any>;
  joinHouse: (code: string) => Promise<any>;
  leaveHouse: (houseId: number) => Promise<any>;
  deleteHouse: (houseId: number) => Promise<any>;
  getUserHouses?: (userId: number) => Promise<any>;
}

let houseApiService: HouseApiService = {} as HouseApiService;

houseApiService.getHouse = async function (houseId: number) {
  try {
    const response = await api.get(`/houses/${houseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching house data:", error);
    throw error;
  }
};

houseApiService.createHouse = async function (houseData: any) {
  try {
    const response = await api.post("/houses", houseData);
    return response.data;
  } catch (error) {
    console.error("Error creating house:", error);
    throw error;
  }
};

houseApiService.getHouseMembers = async function (houseId: number) {
  try {
    const response = await api.get(`/houses/${houseId}/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching house members:", error);
    throw error;
  }
};

houseApiService.joinHouse = async function (code: string) {
  try {
    const response = await api.post(`/houses/invitations/${code}/use`);
    return response.data;
  } catch (error) {
    console.error("Error joining house:", error);
    throw error;
  }
};

houseApiService.leaveHouse = async function (houseId: number) {
  try {
    const response = await api.delete(`/houses/${houseId}/leave`);
    return response.data;
  } catch (error) {
    console.error("Error leaving house:", error);
    throw error;
  }
};

houseApiService.generateInvitationCode = async function (houseId: number) {
  try {
    const response = await api.post(`/houses/${houseId}/invitations`);
    return response.data.code;
  } catch (error) {
    console.error("Error generating invitation code:", error);
    throw error;
  }
};

houseApiService.deleteHouse = async function (houseId: number) {
  try {
    const response = await api.delete(`/houses/${houseId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting house:", error);
    throw error;
  }
};

houseApiService.getUserHouses = async function (userId: number) {
  try {
    const response = await api.get(`/user/${userId}/houses`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user houses:", error);
    throw error;
  }
};

export default houseApiService;

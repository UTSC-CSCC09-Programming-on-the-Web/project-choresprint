import { api } from ".";

interface ChoresApiService {
  getChores: (
    houseId: number,
    params: { limit: number; cursor: number },
  ) => Promise<any>;
  createChore: (choreData: any) => Promise<any>;
  updateChore: (choreId: number, choreData: any) => Promise<any>;
  deleteChore: (choreId: number) => Promise<any>;
  getChore: (choreId: number) => Promise<any>;
  getUserChores: (
    userId: number,
    params: { assignedTo: number; limit: number; cursor: number },
  ) => Promise<any>;
  uploadCompletionPhoto: (choreId: number, formData: FormData) => Promise<any>;
  claimChore: (choreId: number) => Promise<any>;
}

let choresApiService: ChoresApiService = {} as ChoresApiService;

choresApiService.getChores = async function (
  houseId: number,
  params: { limit: number; cursor: number },
) {
  try {
    const response = await api.get(`/houses/${houseId}/chores`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching chores:", error);
    throw error;
  }
};

choresApiService.createChore = async function (choreData: any) {
  try {
    const response = await api.post("/chores", choreData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating chore:", error);
    throw error;
  }
};

choresApiService.updateChore = async function (
  choreId: number,
  choreData: any,
) {
  try {
    const response = await api.patch(`/chores/${choreId}`, choreData);
    return response.data;
  } catch (error) {
    console.error("Error updating chore:", error);
    throw error;
  }
};

choresApiService.deleteChore = async function (choreId: number) {
  try {
    const response = await api.delete(`/chores/${choreId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting chore:", error);
    throw error;
  }
};

choresApiService.getChore = async function (choreId: number) {
  try {
    const response = await api.get(`/chores/${choreId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chore:", error);
    throw error;
  }
};

choresApiService.getUserChores = async function (
  houseId: number,
  params: { assignedTo: number; limit: number; cursor: number },
) {
  try {
    const response = await api.get(`/houses/${houseId}/chores`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching user chores:", error);
    throw error;
  }
};

choresApiService.uploadCompletionPhoto = async function (
  choreId: number,
  formData: FormData,
) {
  try {
    const response = await api.post(
      `/chores/${choreId}/upload-completion-photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading completion photo:", error);
    throw error;
  }
};

choresApiService.claimChore = async function (choreId: number) {
  try {
    const response = await api.post(`/chores/${choreId}/claim`);
    return response.data;
  } catch (error) {
    console.error("Error claiming chore:", error);
    throw error;
  }
};

export default choresApiService;

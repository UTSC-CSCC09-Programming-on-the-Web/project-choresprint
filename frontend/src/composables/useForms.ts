import { ref } from "vue";
import { useHouseStore } from "../stores/house";
import { useChoreStore } from "../stores/chores";

export function useHouseForm() {
  const houseName = ref("");
  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);

  const houseStore = useHouseStore();

  async function createHouse() {
    if (!houseName.value.trim()) {
      error.value = "House name is required";
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const result = await houseStore.createHouse(houseName.value.trim());
      success.value = true;
      houseName.value = "";

      // Redirect after success
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      return result;
    } catch (err: any) {
      error.value = err.message || "Failed to create house";
      return false;
    } finally {
      loading.value = false;
    }
  }

  function resetForm() {
    houseName.value = "";
    error.value = null;
    success.value = false;
  }

  return {
    houseName,
    loading,
    error,
    success,
    createHouse,
    resetForm,
  };
}

export function useJoinHouseForm() {
  const inviteCode = ref("");
  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);

  const houseStore = useHouseStore();

  async function joinHouse() {
    if (!inviteCode.value.trim()) {
      error.value = "Invitation code is required";
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const result = await houseStore.joinHouse(inviteCode.value.trim());
      success.value = true;
      inviteCode.value = "";

      // Redirect after success
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      return result;
    } catch (err: any) {
      error.value = err.message || "Failed to join house";
      return false;
    } finally {
      loading.value = false;
    }
  }

  function resetForm() {
    inviteCode.value = "";
    error.value = null;
    success.value = false;
  }

  return {
    inviteCode,
    loading,
    error,
    success,
    joinHouse,
    resetForm,
  };
}
export function useChoreForm() {
  const houseStore = useHouseStore();

  // get todays date in YYYY-MM-DD format
  function getToday() {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }

  const form = ref({
    title: "",
    description: "",
    points: 10,
    dueDate: getToday(), // Default to today
    assignedToId: null as number | null, // Explicitly allow null
    referencePhoto: null as File | null,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);
  const previewUrl = ref<string | null>(null);

  const choreStore = useChoreStore();

  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = "Image size exceeds 5MB limit";
        return;
      }

      form.value.referencePhoto = file;

      // Create preview URL
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
      previewUrl.value = URL.createObjectURL(file);
    }
  }

  function resetImage() {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = null;
    form.value.referencePhoto = null;

    // Reset file input
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  async function createChore() {
    if (!form.value.title.trim()) {
      error.value = "Title is required";
      return false;
    }

    if (!form.value.points || form.value.points < 1) {
      error.value = "Points must be at least 1";
      return false;
    }

    if (!form.value.referencePhoto) {
      error.value = "Reference image is required";
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      //   const choreData: any = {
      //     title: form.value.title,
      //     description: form.value.description || null, // Allow null
      //     points: form.value.points,
      //     houseId: houseId,
      //     dueDate: form.value.dueDate || null, // Allow null
      //     assignedToId: form.value.assignedToId || null, // Allow null
      //   };

      //   // If there's a reference photo, upload it first
      //   if (form.value.referencePhoto) {
      //     const formData = new FormData();
      //     formData.append("file", form.value.referencePhoto);

      //     const { data: uploadResult } = await api.post("/upload", formData, {
      //       headers: {
      //         "Content-Type": "multipart/form-data",
      //       },
      //     });

      //     choreData.referencePhotoUrl = uploadResult.url;
      //   }

      const currentHouseId = houseStore.currentHouse?.id;
      if (!currentHouseId) {
        error.value = "No house selected";
        return false;
      }

      const formData = new FormData();
      formData.append("title", form.value.title);
      formData.append("description", form.value.description || "");
      formData.append("points", String(form.value.points));
      formData.append("houseId", String(currentHouseId));

      if (form.value.dueDate) {
        
        formData.append("dueDate", form.value.dueDate);
      }

      if (form.value.assignedToId) {
        formData.append("assignedToId", String(form.value.assignedToId));
      }

      if (form.value.referencePhoto) {
        formData.append("file", form.value.referencePhoto);
      }

      const result = await choreStore.createChore(formData);
      success.value = true;

      // Hide success message after 3 seconds
      setTimeout(() => {
        success.value = false;
      }, 3000);

      return result;
    } catch (err: any) {
      error.value = err.message || "Failed to create chore";
      return false;
    } finally {
      loading.value = false;
    }
  }

  function resetForm() {
    form.value = {
      title: "",
      description: "",
      points: 10,
      dueDate: getToday(),
      assignedToId: null,
      referencePhoto: null,
    };
    resetImage();
    error.value = null;
    success.value = false;
  }

  return {
    form,
    loading,
    error,
    success,
    previewUrl,
    handleImageChange,
    resetImage,
    createChore,
    resetForm,
  };
}

export function useInviteCodeGenerator() {
  const inviteCode = ref("");
  const loading = ref(false);
  const error = ref<string | null>(null);
  const copied = ref(false);

  async function generateInviteCode() {
    loading.value = true;
    error.value = null;
    const houseStore = useHouseStore();

    try {
      const code = await houseStore.generateInvitation();
      inviteCode.value = code;
      return code;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Failed to generate invite code";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function copyToClipboard() {
    navigator.clipboard
      .writeText(inviteCode.value)
      .then(() => {
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      })
      .catch(() => {
        error.value = "Failed to copy to clipboard";
      });
  }

  return {
    inviteCode,
    loading,
    error,
    copied,
    generateInviteCode,
    copyToClipboard,
  };
}

export function useChoreCompletionForm() {
  const form = ref({
    proofPhoto: null as File | null,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);

  const choreStore = useChoreStore();

  async function submit(choreId: number) {
    if (!form.value.proofPhoto) {
      error.value = "Please upload a proof photo";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("file", form.value.proofPhoto);

      await choreStore.uploadCompletionPhoto(choreId, formData);
      success.value = true;

      // Hide success message after 3 seconds
      setTimeout(() => {
        success.value = false;
      }, 3000);
    } catch (err: any) {
      error.value = err.message || "Failed to submit completion";
    } finally {
      loading.value = false;
    }
  }

  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = "Image size exceeds 5MB limit";
        return;
      }

      form.value.proofPhoto = file;

      // Create preview URL
      // if (previewUrl.value) {
      //   URL.revokeObjectURL(previewUrl.value);
      // }
      // previewUrl.value = URL.createObjectURL(file);
    }
  }

  return {
    form,
    loading,
    error,
    success,
    submit,
    handleImageChange,
  };
}

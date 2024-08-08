import axiosInstance from "./axiosInstance";

export const uploadFile = async (file: File, language: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  try {
    const response = await axiosInstance.post("/upload", formData);
    return response.data.message;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed.");
  }
};

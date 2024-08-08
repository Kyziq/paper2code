import axios from "axios";

const apiBaseUrl = import.meta.env.API_BASE_URL;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  timeout: 10000, // 10 seconds timeout
});

export default axiosInstance;

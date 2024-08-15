import { ApiResponse, ErrorResponse } from '@shared/types';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  (error: AxiosError<ErrorResponse>) => {
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      const { status, data } = error.response;
      errorMessage = data.message || `Error ${status}`;
    } else if (error.request) {
      errorMessage = 'No response received from server';
    } else {
      errorMessage = error.message || 'Error setting up the request';
    }

    return Promise.reject(new Error(errorMessage));
  },
);
export default axiosInstance;

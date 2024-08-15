import axios, { AxiosError } from 'axios';

const apiBaseUrl = import.meta.env.API_BASE_URL;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  timeout: 10000, // 10 seconds timeout
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 400:
          error.message = 'Bad Request';
          break;
        case 401:
          error.message = 'Unauthorized';
          break;
        case 403:
          error.message = 'Forbidden';
          break;
        case 404:
          error.message = 'Not Found';
          break;
        case 413:
          error.message = 'File size exceeds the limit';
          break;
        case 415:
          error.message = 'Unsupported file type';
          break;
        case 500:
          error.message = 'Internal Server Error';
          break;
        default:
          error.message = 'An unexpected error occurred';
      }
    } else if (error.request) {
      // The request was made but no response was received
      error.message = 'No response received from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      error.message = 'Error setting up the request';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

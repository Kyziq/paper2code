import { ErrorResponse } from '@shared/types';
import ky from 'ky';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const kyInstance = ky.extend({
  prefixUrl: `${apiBaseUrl}/api`,
  timeout: 30000,
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.message || `Error ${errorData.statusCode}`);
        }
      },
    ],
  },
  retry: 0,
});

export default kyInstance;

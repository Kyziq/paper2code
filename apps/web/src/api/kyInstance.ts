import { ErrorResponse } from '@shared/types';
import ky from 'ky';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const kyInstance = ky.extend({
  prefixUrl: `${apiBaseUrl}/api`,
  timeout: 10000,
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.message || `Error ${response.status}`);
        }
      },
    ],
  },
  retry: 0,
});

export default kyInstance;

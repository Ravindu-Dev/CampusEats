import axios from 'axios';
import authService from './authService';

const api = axios.create({
    baseURL: '/api',
});

// Add JWT token to requests (only if not already set by the caller)
api.interceptors.request.use(
    (config) => {
        // If the caller already set an Authorization header (e.g., canteen owner token),
        // do NOT overwrite it with the user token.
        if (!config.headers.Authorization) {
            const user = authService.getCurrentUser();
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Track whether a token refresh is already in progress
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Handle 401 errors — attempt token refresh before logging out
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Don't attempt refresh for login or refresh requests themselves
            if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            // Check if this request was made with a non-user token (e.g., canteen owner token).
            // If so, don't try to refresh the user token — just let it fail gracefully.
            const user = authService.getCurrentUser();
            const userToken = user?.token;
            const requestToken = originalRequest.headers?.Authorization?.replace('Bearer ', '');
            if (requestToken && requestToken !== userToken) {
                // This was a canteen/admin request with its own token — don't interfere
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue this request until the refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                if (!user || !user.token) {
                    throw new Error('No token available');
                }

                const refreshResponse = await axios.post('/api/auth/refresh', {}, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                const newToken = refreshResponse.data.token;
                // Update stored user data with new token
                const updatedUser = { ...refreshResponse.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                processQueue(null, newToken);

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

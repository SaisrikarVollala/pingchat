import axios from 'axios';
 import { useAuthStore } from '../store/useAuthStore';
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      await logout();
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
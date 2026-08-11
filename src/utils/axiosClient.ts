import axios from 'axios';
import { store } from '../store/store';
import { setCredentials, logout } from '../store/slices/authSlice';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Biến cờ hiệu để biết Axios đang trong quá trình đi xin lại Token hay không
let isRefreshing = false;
// Hàng đợi chứa các API bị lỗi 401 cần chờ xin token mới để chạy lại
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============ TRƯỚC KHI GỬI ĐI ============
axiosClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ SAU KHI NHẬN VỀ ============
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;

      // 1. Xử lý lỗi 401 (Hết hạn Token)
      if (status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/login') {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        // Bắt đầu đi xin Token mới
        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        
        // Nếu không có Refresh Token trong ổ cứng -> Đăng nhập lại luôn
        if (!refreshToken) {
          store.dispatch(logout());
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const res = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken });
          
          // Lấy token theo đúng chuẩn API Docs của Mentor
          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;

          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Cập nhật Token mới vào RAM
          store.dispatch(setCredentials({ accessToken: newAccessToken }));

          // Xả trạm, cho các API đang chờ chạy tiếp
          processQueue(null, newAccessToken);

          // Chạy lại API vừa bị lỗi 401 ban đầu
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);

        } catch (refreshError) {
          // Xin token mới thất bại (Refresh Token hết hạn) -> Xóa sạch, đuổi ra chuồng gà
          processQueue(refreshError, null);
          store.dispatch(logout());
          localStorage.removeItem('refreshToken');
          window.location.href = '/401'; // Chuyển ra trang lỗi 401 thay vì Login
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 2. Bắt các lỗi phân quyền và server, chuyển hướng ra trang Error của em
      if (status === 403) {
        window.location.href = '/403';
      } else if (status === 404) {
        window.location.href = '/404';
      } else if (status >= 500) {
        window.location.href = '/500';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
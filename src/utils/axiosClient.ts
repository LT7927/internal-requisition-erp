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
    // Rút Access Token từ bộ nhớ RAM (Redux) ra
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

    // Nếu lỗi 401 và chưa từng retry lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang có một API khác đi xin Token rồi, thì API này phải xếp hàng chờ
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
        // Gọi thẳng API Refresh (Dùng axios thường để không bị dính vòng lặp của axiosClient)
        const res = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken });
        
        // Lưu ý: Cần kiểm tra kỹ tên biến từ Backend trả về (ở đây giả định là accessToken và refreshToken)
        const newAccessToken = res.data.data?.accessToken || res.data.accessToken || res.data.data?.token || res.data.token;
        const newRefreshToken = res.data.data?.refreshToken || res.data.refreshToken;

        // Backend có thể cấp lại cả Refresh Token mới (Token Rotation), nếu có thì lưu đè lên cái cũ
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
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
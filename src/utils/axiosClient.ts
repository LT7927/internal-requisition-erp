import axios from 'axios';

// Khởi tạo một instance của axios
const axiosClient = axios.create({
  baseURL: 'http://localhost:3000', // Đảm bảo giữ nguyên API_BASE_URL này theo API Docs của em
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request (Trước khi gửi lên server)
axiosClient.interceptors.request.use(
  (config) => {
    // Tạm thời để trống, đến Bước 3 đăng nhập xong ta sẽ lôi Token từ LocalStorage nhét vào đây
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response (Sau khi server trả về)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý lỗi tập trung ở đây (ví dụ: 401 thì văng ra login)
    return Promise.reject(error);
  }
);

export default axiosClient;
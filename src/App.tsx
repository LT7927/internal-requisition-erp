import { useEffect, useState, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Spin } from 'antd';
import AppRouter from './routes/AppRouter';
import { setCredentials, logout } from './store/slices/authSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // 1. Khai báo cờ khóa để chặn Strict Mode gọi 2 lần
  const isMounted = useRef(false); 

  useEffect(() => {
    // Nếu cờ đã bật (đã chạy 1 lần rồi) thì chặn đứng không cho chạy lần 2
    if (isMounted.current) return;
    isMounted.current = true;

    const initializeAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken });
          
          // 2. Lấy token từ res.data.data
          const newAccessToken = res.data.data?.accessToken || res.data.accessToken || res.data.data?.token || res.data.token;
          const newRefreshToken = res.data.data?.refreshToken || res.data.refreshToken;

          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          
          dispatch(setCredentials({ accessToken: newAccessToken }));

          const profileRes = await axios.get('http://localhost:3000/api/auth/profile', {
            headers: { Authorization: `Bearer ${newAccessToken}` }
          });
          
          dispatch(setCredentials({ accessToken: newAccessToken, user: profileRes.data.data || profileRes.data }));
        } catch (error) {
          dispatch(logout());
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [dispatch]);

  if (isInitializing) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
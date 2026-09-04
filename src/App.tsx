import { useEffect, useState, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Spin, ConfigProvider, theme } from 'antd';
import AppRouter from './routes/AppRouter';
import { setCredentials, logout } from './store/slices/authSlice';
import { RootState } from './store/store';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);
  const { mode } = useSelector((state: RootState) => state.theme);
  
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
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: mode === 'dark' ? '#000' : '#fff' }}><Spin size="large" /></div>;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
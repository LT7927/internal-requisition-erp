import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntdApp } from 'antd';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tắt tính năng tự động gọi lại API khi chuyển tab trình duyệt
      retry: 1, // Nếu API lỗi, thử gọi lại 1 lần
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
          {/* Bọc AntdApp ra ngoài cùng */}
          <AntdApp>
            <App /> 
          </AntdApp>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
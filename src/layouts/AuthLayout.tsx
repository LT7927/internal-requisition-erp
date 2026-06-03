import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#f0f2f5' 
    }}>
      {/* Outlet là nơi React Router sẽ hiển thị component trang Login vào đây */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;
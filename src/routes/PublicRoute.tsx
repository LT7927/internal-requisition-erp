import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const PublicRoute = () => {
  // Rút trạng thái đăng nhập từ kho Redux
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Nếu đã đăng nhập -> chuyển hướng vào trong. Nếu chưa -> cho phép đi tiếp (vào trang Login)
  return isAuthenticated ? <Navigate to="/requisitions/my" replace /> : <Outlet />;
};

export default PublicRoute;
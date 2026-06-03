import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Mảng chứa các role được phép vào (VD: ['Admin', 'Manager'])
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Lớp bảo vệ 1: Chưa đăng nhập -> đuổi ra trang Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Lớp bảo vệ 2: Đã đăng nhập nhưng không đủ quyền -> ném ra trang 403
  // Giả định backend trả về thuộc tính role trong user (VD: user.role = 'Staff')
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // Hợp lệ toàn bộ -> Cho phép đi tiếp vào giao diện trang
  return <Outlet />;
};

export default ProtectedRoute;

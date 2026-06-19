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

  // Lớp bảo vệ 2: Phân quyền Role (Xử lý triệt để hoa/thường)
  if (allowedRoles && user) {
    // Ép role của user từ Backend thành chữ IN HOA
    const userRole = user.role ? String(user.role).toUpperCase() : '';
    
    // Kiểm tra xem role của user có nằm trong danh sách cho phép không (cũng ép IN HOA để so sánh)
    const isAllowed = allowedRoles.some((role) => role.toUpperCase() === userRole);

    if (!isAllowed) {
      return <Navigate to="/403" replace />;
    }
  }

  // Hợp lệ toàn bộ -> Cho phép đi tiếp vào giao diện trang
  return <Outlet />;
};

export default ProtectedRoute;
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Mảng chứa các role được phép vào
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    // Ép role của user từ Backend thành chữ IN HOA
    const userRole = user.role ? String(user.role).toUpperCase() : '';
    
    // Kiểm tra xem role của user có nằm trong danh sách cho phép không (cũng ép IN HOA để so sánh)
    const isAllowed = allowedRoles.some((role) => role.toUpperCase() === userRole);

    if (!isAllowed) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
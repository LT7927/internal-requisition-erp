import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import ServerErrorPage from '../pages/errors/ServerErrorPage';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Component tạm thời (Mock) cho các trang sẽ làm ở Bước 5 & 6
const MyRequisitions = () => <div>Giao diện Danh sách yêu cầu của tôi (Đang xây dựng)</div>;
const PendingApprovals = () => <div>Giao diện Chờ duyệt (Đang xây dựng)</div>;
const DepartmentManagement = () => <div>Giao diện Quản lý phòng ban (Đang xây dựng)</div>;

const AppRouter = () => {
  return (
    <Routes>
      {/* 1. Vùng Public (Chỉ dành cho người chưa đăng nhập) */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>

      {/* 2. Vùng Protected (Cần phải đăng nhập) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          
          {/* Tự động chuyển hướng từ gốc (/) sang trang danh sách */}
          <Route path="/" element={<Navigate to="/requisitions/my" replace />} />
          
          {/* Cấp độ Staff (Ai đăng nhập vào cũng xem được) */}
          <Route path="/requisitions/my" element={<MyRequisitions />} />

          {/* Cấp độ Manager & Admin (Staff không được vào) */}
          <Route element={<ProtectedRoute allowedRoles={['Manager', 'Admin']} />}>
            <Route path="/approvals/pending" element={<PendingApprovals />} />
          </Route>

          {/* Cấp độ Admin tối cao (Quản lý Master Data) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/categories/departments" element={<DepartmentManagement />} />
          </Route>

        </Route>
      </Route>

      {/* 3. Vùng Lỗi (Nằm ngoài cùng, ai vào cũng được) */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      {/* Bắt mọi URL gõ sai khác bằng trang 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
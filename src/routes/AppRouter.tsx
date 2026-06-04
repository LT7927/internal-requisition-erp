import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import ServerErrorPage from '../pages/errors/ServerErrorPage';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import { routeConfig } from './routeConfig';

const AppRouter = () => {
  return (
    <Routes>
      {/* ================= 1. VÙNG PUBLIC ROUTES ================= */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          {routeConfig.publicRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={<route.component />} 
            />
          ))}
        </Route>
      </Route>

      {/* ================= 2. VÙNG PROTECTED ROUTES ================= */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          
          {/* Tự động điều hướng từ trang gốc (/) sang trang mặc định của Staff */}
          <Route path="/" element={<Navigate to="/requisitions/my" replace />} />

          {/* Vòng lặp tự động rải và phân quyền cho từng trang nội bộ */}
          {routeConfig.protectedRoutes.map((route) => {
            // Nếu route có quy định quyền (allowedRoles), bọc thêm 1 lớp ProtectedRoute riêng cho nó
            if (route.allowedRoles) {
              return (
                <Route
                  key={route.path}
                  element={<ProtectedRoute allowedRoles={route.allowedRoles} />}
                >
                  <Route path={route.path} element={<route.component />} />
                </Route>
              );
            }

            // Nếu route không quy định quyền, ai đăng nhập cũng vào được
            return (
              <Route 
                key={route.path} 
                path={route.path} 
                element={<route.component />} 
              />
            );
          })}
        </Route>
      </Route>

      {/* ================= 3. VÙNG HỆ THỐNG LỖI ================= */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
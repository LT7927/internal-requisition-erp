import React from 'react';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import ServerErrorPage from '../pages/errors/ServerErrorPage';
import DepartmentPage from '../pages/department/DepartmentPage';
import UserPage from '../pages/user/UserPage';

// Component tạm thời (Mock) cho các trang ở Bước 5 & 6
const MyRequisitions = () => React.createElement('div', null, 'Giao diện Danh sách yêu cầu của tôi (Đang xây dựng)');
const PendingApprovals = () => React.createElement('div', null, 'Giao diện Chờ duyệt (Đang xây dựng)');
// const DepartmentManagement = () => React.createElement('div', null, 'Giao diện Quản lý phòng ban (Đang xây dựng)');

// Định nghĩa kiểu dữ liệu cho một Tuyến đường
export interface RouteItem {
  path: string;
  component: React.ComponentType;
  allowedRoles?: string[]; // Nếu không có thuộc tính này nghĩa là ai đăng nhập cũng vào được
}

export interface LayoutRouteConfig {
  publicRoutes: RouteItem[];
  protectedRoutes: RouteItem[];
}

// Bảng cấu hình tập trung cho toàn bộ ứng dụng
export const routeConfig: LayoutRouteConfig = {
  // 1. Các tuyến đường không cần đăng nhập (Nằm trong AuthLayout)
  publicRoutes: [
    { path: '/login', component: LoginPage }
  ],
  
  // 2. Các tuyến đường bắt buộc đăng nhập (Nằm trong MainLayout)
  protectedRoutes: [
    { path: '/requisitions/my', component: MyRequisitions },
    { path: '/approvals/pending', component: PendingApprovals, allowedRoles: ['Manager', 'Admin'] },
    { path: '/categories/departments', component: DepartmentPage, allowedRoles: ['Admin'] },
    { path: '/user', component: UserPage },
  ]
};
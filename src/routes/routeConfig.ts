import React from 'react';
import LoginPage from '../pages/auth/LoginPage';
// import NotFoundPage from '../pages/errors/NotFoundPage';
// import ForbiddenPage from '../pages/errors/ForbiddenPage';
// import ServerErrorPage from '../pages/errors/ServerErrorPage';
import DepartmentPage from '../pages/department/DepartmentPage';
import UserPage from '../pages/user/UserPage';
import TypePage from '../pages/type/TypePage';
import RequisitionPage from '../pages/requisition/RequisitionPage';
import ApprovalPage from '../pages/approval/ApprovalPage';

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
  // 1. Các tuyến đường không cần đăng nhập
  publicRoutes: [
    { path: '/login', component: LoginPage }
  ],
  
  // 2. Các tuyến đường bắt buộc đăng nhập
  protectedRoutes: [
    { path: '/categories/departments', component: DepartmentPage, allowedRoles: ['Admin'] },
    { path: '/user', component: UserPage },
    { path: '/types', component: TypePage },
    { path: '/requisitions/my', component: RequisitionPage },
    { path: '/approvals/pending', component: ApprovalPage },
  ]
};
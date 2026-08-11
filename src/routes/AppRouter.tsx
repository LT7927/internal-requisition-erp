import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import ServerErrorPage from '../pages/errors/ServerErrorPage';
import UnauthorizedPage from '../pages/errors/UnauthorizedPage';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import { routeConfig } from './routeConfig';
import ErrorBoundary from '../components/common/ErrorBoundary';

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* VÙNG PUBLIC ROUTES */}
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

        {/* VÙNG PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/requisitions/my" replace />} />

            {routeConfig.protectedRoutes.map((route) => {
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

        {/* VÙNG HỆ THỐNG LỖI */}
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRouter;
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RotaProtegida() {
  const { usuario } = useAuth();
  const local = useLocation();
  if (!usuario) {
    return <Navigate to="/login" replace state={{ origem: local.pathname }} />;
  }
  return <Outlet />;
}

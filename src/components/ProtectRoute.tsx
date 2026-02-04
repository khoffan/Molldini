import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Navigate, Outlet } from 'react-router';

function ProtectRoute() {
    const { user } = useSelector((state: RootState) => state.auth);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}

export default ProtectRoute
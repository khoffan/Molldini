import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Navigate, Outlet } from 'react-router';
import LoadingCircularSkelition from './loadingComponent/LoadingCircularSkelition';

function ProtectRoute() {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    if (!isAuthenticated) {
        return <LoadingCircularSkelition />
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}

export default ProtectRoute
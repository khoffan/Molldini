import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import type { RootState } from '../store';

export const useGuardAction = () => {
    const { isSynced } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    // คืนค่าเป็น function ที่รับ action เข้าไปรัน
    const checkAuth = (action: () => void) => {
        if (!isSynced) {
            Swal.fire({
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'คุณต้องเข้าสู่ระบบก่อนดำเนินการต่อ',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'เข้าสู่ระบบ',
                cancelButtonText: 'ยกเลิก'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
        } else {
            // ถ้า login แล้ว ให้รัน action ที่ส่งเข้ามา
            action();
        }
    };

    return { checkAuth };
};
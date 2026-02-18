/* eslint-disable @typescript-eslint/no-explicit-any */
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const showToast = ({
    isToast = true,
    title,
    icon = 'success',
    position = 'top-end',
    timer = 2000,
    timerProgressBar = true,
    text,
    didOpen,
}: {
    isToast?: boolean
    title: string;
    icon?: 'success' | 'error' | 'warning' | 'info';
    position?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
    timer?: number;
    timerProgressBar?: boolean;
    text?: string | undefined
    didOpen?: (toast: any) => void;
}) => {
    Toast.fire({
        toast: isToast,
        title,
        icon,
        position,
        showConfirmButton: isToast ? false : true,
        timer,
        timerProgressBar,
        text,
        didOpen: didOpen,
    });
}
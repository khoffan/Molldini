/**
 * Format Order Utilities
 * Separated logic from styling — pure formatting & status config functions
 */

// ─── Currency Formatting ─────────────────────────────────────────
export const formatCurrency = (amount: number | string | null | undefined): string => {
    const num = Number(amount || 0);
    return `฿${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Date Formatting (DD MMM YYYY, HH:mm) ────────────────────────
export const formatDate = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

// ─── Relative Time Until Expiry ──────────────────────────────────
export const getTimeUntilExpiry = (expiredAt: string | Date | null | undefined): string | null => {
    if (!expiredAt) return null;
    const now = new Date();
    const expiry = new Date(expiredAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'หมดอายุแล้ว';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours} ชม. ${minutes} น.`;
    return `${minutes} นาที`;
};

// ─── Order Status Configuration ──────────────────────────────────
export interface StatusConfig {
    label: string;
    labelEn: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    dotColor: string;
}

export const getOrderStatusConfig = (status: string): StatusConfig => {
    switch (status?.toUpperCase()) {
        case 'PAID':
            return {
                label: 'ชำระเงินแล้ว',
                labelEn: 'PAID',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-600',
                borderColor: 'border-blue-200',
                dotColor: 'bg-blue-500',
            };
        case 'SHIPPED':
            return {
                label: 'จัดส่งแล้ว',
                labelEn: 'SHIPPED',
                bgColor: 'bg-indigo-50',
                textColor: 'text-indigo-600',
                borderColor: 'border-indigo-200',
                dotColor: 'bg-indigo-500',
            };
        case 'DELIVERED':
            return {
                label: 'ได้รับสินค้าแล้ว',
                labelEn: 'DELIVERED',
                bgColor: 'bg-emerald-50',
                textColor: 'text-emerald-600',
                borderColor: 'border-emerald-200',
                dotColor: 'bg-emerald-500',
            };
        case 'CANCELLED':
            return {
                label: 'ยกเลิกแล้ว',
                labelEn: 'CANCELLED',
                bgColor: 'bg-gray-50',
                textColor: 'text-gray-500',
                borderColor: 'border-gray-200',
                dotColor: 'bg-gray-400',
            };
        case 'SUCCESS':
            return {
                label: 'สำเร็จ',
                labelEn: 'SUCCESS',
                bgColor: 'bg-green-50',
                textColor: 'text-green-600',
                borderColor: 'border-green-200',
                dotColor: 'bg-green-500',
            };
        case 'PENDING':
        default:
            return {
                label: 'รอชำระเงิน',
                labelEn: 'PENDING',
                bgColor: 'bg-amber-50',
                textColor: 'text-amber-600',
                borderColor: 'border-amber-200',
                dotColor: 'bg-amber-500',
            };
    }
};

export const getInvoiceStatusConfig = (status: string): StatusConfig => {
    switch (status?.toUpperCase()) {
        case 'PAID':
            return {
                label: 'ชำระแล้ว',
                labelEn: 'PAID',
                bgColor: 'bg-emerald-50',
                textColor: 'text-emerald-600',
                borderColor: 'border-emerald-200',
                dotColor: 'bg-emerald-500',
            };
        case 'UNPAID':
        default:
            return {
                label: 'ยังไม่ชำระ',
                labelEn: 'UNPAID',
                bgColor: 'bg-red-50',
                textColor: 'text-red-500',
                borderColor: 'border-red-100',
                dotColor: 'bg-red-500',
            };
    }
};

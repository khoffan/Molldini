
import { useSelector } from 'react-redux';
import { Package, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
// import type { RootState } from '../../store';
import {
    selectOrderSummary,
    selectValidateCheckout,
    selectIsAnyCalculating
} from '../../service/checkoutService';
import { formatCurrency, formatDate, getOrderStatusConfig, getInvoiceStatusConfig, getTimeUntilExpiry } from '../../utils/formatOrder';

/** Status Badge */
const OrderStatusBadge = ({ status }: { status: string }) => {
    const config = getOrderStatusConfig(status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
            {config.label}
        </span>
    );
};

/** Invoice Status Badge */
const InvoiceStatusBadge = ({ status }: { status: string }) => {
    const config = getInvoiceStatusConfig(status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
            {config.label}
        </span>
    );
};

/** Expiry Countdown */
const ExpiryCountdown = ({ expiredAt, status }: { expiredAt?: string | Date; status: string }) => {
    if (status?.toUpperCase() !== 'PENDING' || !expiredAt) return null;

    const timeLeft = getTimeUntilExpiry(expiredAt);
    if (!timeLeft) return null;

    const isExpired = timeLeft === 'หมดอายุแล้ว';

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border mb-4 ${isExpired
            ? 'bg-red-50 text-red-600 border-red-100'
            : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
            <span>{isExpired ? 'คำสั่งซื้อหมดอายุแล้ว' : `ชำระภายใน ${timeLeft}`}</span>
        </div>
    );
};

interface OrderSummarySidebarProps {
    orderStatus: string;
    orderId?: string;
    createdAt?: string | Date;
    expiredAt?: string | Date;
    invoice?: any;
}

export default function OrderSummarySidebar({
    orderStatus,
    orderId,
    createdAt,
    expiredAt,
    invoice
}: OrderSummarySidebarProps) {
    const summary = useSelector(selectOrderSummary);
    const isValid = useSelector(selectValidateCheckout);
    const isCalculating = useSelector(selectIsAnyCalculating);

    const shortOrderId = orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : '';
    const statusConfig = getOrderStatusConfig(orderStatus);

    return (
        <div className="p-4 lg:p-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-content flex items-center gap-2">
                    <Package className="text-primary" size={20} />
                    สรุปคำสั่งซื้อ
                </h2>
                <OrderStatusBadge status={orderStatus} />
            </div>

            {/* Short Order ID & Date (Desktop only) */}
            {orderId && (
                <div className="hidden lg:flex items-center justify-between mb-4 pb-3 border-b border-border-main/60">
                    <span className="text-xs text-muted font-mono font-semibold">{shortOrderId}</span>
                    {createdAt && (
                        <span className="text-[11px] text-muted">{formatDate(createdAt)}</span>
                    )}
                </div>
            )}

            {/* Expiry Countdown */}
            <div className="hidden lg:block">
                <ExpiryCountdown expiredAt={expiredAt} status={orderStatus} />
            </div>

            {/* Item Count */}
            <div className="hidden lg:flex items-center gap-2 mb-4 text-xs text-muted">
                <Package size={12} />
                <span>ทั้งหมด {summary.itemCount} รายการ จาก {summary.merchantCount} ร้านค้า</span>
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-border-main space-y-3">
                <div className="hidden lg:flex flex-col gap-2.5 mb-2">
                    <div className="flex justify-between text-sm text-muted">
                        <span>ราคารวมสินค้า</span>
                        <span className="font-medium text-content">{formatCurrency(summary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted">
                        <span>ค่าจัดส่งรวม</span>
                        <span className={`font-medium ${summary.totalShipping === 0 ? 'text-emerald-600' : 'text-content'}`}>
                            {summary.totalShipping === 0 ? 'ฟรี' : formatCurrency(summary.totalShipping)}
                        </span>
                    </div>
                </div>

                {/* Validation Warning */}
                {!isValid && (
                    <div className="hidden lg:block p-2.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-medium text-center border border-red-100 mb-2 mt-0">
                        กรุณาเลือกช่องทางการจัดส่งให้ครบทุกรายการ
                    </div>
                )}

                {/* Invoice Status */}
                {invoice && (
                    <div className="hidden lg:flex items-center justify-between py-2 px-3 rounded-xl bg-main/40 border border-border-main/50 mb-3">
                        <span className="text-xs font-semibold text-muted">Invoice</span>
                        <InvoiceStatusBadge status={invoice.status} />
                    </div>
                )}

                {/* Main Action Area */}
                <div className="flex flex-row items-center justify-between gap-4 lg:flex-col lg:items-stretch lg:gap-4 lg:pt-3 lg:border-t lg:border-border-main">

                    {/* Net Total */}
                    <div className="flex flex-col">
                        <span className="text-[10px] lg:text-xs text-muted uppercase font-black tracking-widest">
                            ยอดชำระสุทธิ
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className={`text-2xl lg:text-3xl font-black leading-none transition-all duration-300 ${isCalculating ? 'opacity-50 scale-95 blur-[1px]' : 'opacity-100 scale-100 blur-0'
                                } ${statusConfig.textColor === 'text-amber-600' ? 'text-primary' : statusConfig.textColor}`}>
                                {formatCurrency(summary.grandTotal)}
                            </span>
                        </div>
                    </div>

                    {/* Submit Button (Controlled by Parent via type="submit") */}
                    <button
                        type="submit"
                        disabled={!isValid || isCalculating}
                        className={`
                            px-6 py-3.5 lg:w-full lg:py-4 lg:mt-2
                            rounded-xl lg:rounded-2xl
                            font-bold text-base lg:text-lg
                            transition-all duration-200
                            flex items-center justify-center gap-2 group
                            ${isValid && !isCalculating
                                ? 'bg-primary text-white shadow-[0_10px_20px_-10px_rgba(var(--primary-rgb),0.5)] hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]'
                                : 'bg-main text-muted cursor-not-allowed border border-border-main'
                            }
                        `}
                    >
                        <span className="whitespace-nowrap">
                            {isCalculating ? 'กำลังคำนวณ...' : 'ยืนยันการสั่งซื้อ'}
                        </span>
                        {!isCalculating && <ChevronRight size={20} className={`transition-transform ${isValid ? 'group-hover:translate-x-1' : ''}`} />}
                    </button>
                </div>

                {/* Secure Notes */}
                <div className="hidden lg:flex items-center justify-center gap-2 pt-2 text-[11px] text-muted font-bold uppercase tracking-tighter">
                    <Lock size={12} className="text-emerald-500" />
                    <span>Secure Checkout</span>
                    <span className="mx-1">•</span>
                    <span>Buyer Protection</span>
                </div>
                <div className="hidden lg:flex mt-2 items-center justify-center gap-2 text-[10px] text-muted uppercase tracking-widest font-bold">
                    <CheckCircle2 size={12} />
                    <span>Secure SSL Encryption</span>
                </div>
            </div>
        </div>
    );
}

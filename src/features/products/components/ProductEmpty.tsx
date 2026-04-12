import { RefreshCcw, PackageSearch, AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router';

interface ProductEmptyProps {
    status?: 'empty' | 'error';
    message?: string;
    onRetry?: () => void;
}

export default function ProductEmpty({
    status = 'empty',
    message,
    onRetry
}: ProductEmptyProps) {
    const navigate = useNavigate();

    const isError = status === 'error';

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
            {/* Icon Container */}
            <div className={`mb-6 p-6 rounded-full ${isError ? 'bg-red-50' : 'bg-primary-light'}`}>
                {isError ? (
                    <AlertCircle size={48} className="text-red-500" />
                ) : (
                    <PackageSearch size={48} className="text-primary" />
                )}
            </div>

            {/* Text Content */}
            <h2 className="text-2xl font-black text-content mb-2">
                {isError ? 'เกิดข้อผิดพลาดจากระบบ' : 'ไม่พบสินค้าที่ต้องการ'}
            </h2>
            <p className="text-muted max-w-md mb-8 font-medium">
                {message || (isError
                    ? 'ขออภัย ระบบขัดข้องชั่วคราว กำลังเร่งแก้ไขให้กลับมาใช้งานได้ปกติ'
                    : 'ดูเหมือนว่าตอนนี้จะยังไม่มีสินค้าในหมวดหมู่นี้ ลองเลือกดูหมวดหมู่อื่นดูไหม?')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                {isError && onRetry ? (
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-black hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <RefreshCcw size={18} /> ลองใหม่อีกครั้ง
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-black hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <Home size={18} /> กลับสู่หน้าหลัก
                    </button>
                )}

                {!isError && (
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 bg-surface border-2 border-border-main text-content px-8 py-3 rounded-2xl font-black hover:bg-main transition-all active:scale-95"
                    >
                        <RefreshCcw size={18} /> รีเฟรชหน้าเว็บ
                    </button>
                )}
            </div>
        </div>
    );
}
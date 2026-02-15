import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { QrCode, ArrowLeft, Download, Info } from 'lucide-react';

export default function QRcodePage() {
    const location = useLocation();
    const navigate = useNavigate();

    // รับข้อมูลจาก state ที่ส่งมาจากหน้า checkout
    const { qrUri, orderId, amount } = location.state || {};

    // ตัวนับเวลาถอยหลัง (ตัวอย่าง 24 ชม.)
    // const [timeLeft, setTimeLeft] = useState<string>("23:59:59");

    useEffect(() => {
        if (!qrUri) {
            navigate('/'); // ถ้าไม่มีข้อมูล QR ให้เด้งกลับหน้าหลัก
        }
    }, [qrUri, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-md mx-auto">
                {/* Header Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                    {/* Payment Header */}
                    <div className="bg-blue-600 p-8 text-center text-white">
                        <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">จำนวนเงินที่ต้องชำระ</p>
                        <h2 className="text-4xl font-black">฿{amount?.toLocaleString()}</h2>
                    </div>

                    <div className="p-8 flex flex-col items-center">
                        {/* QR Code Container */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl blur opacity-25"></div>
                            <div className="relative bg-white p-4 rounded-2xl border-2 border-slate-100">
                                <img
                                    src={qrUri}
                                    alt="PromptPay QR Code"
                                    className="w-64 h-64 object-contain"
                                />
                            </div>
                        </div>

                        {/* Branding / Type */}
                        <div className="flex items-center mt-6 space-x-2">
                            <div className="bg-blue-100 p-1.5 rounded-lg">
                                <QrCode size={20} className="text-blue-600" />
                            </div>
                            <span className="font-bold text-slate-700 text-lg">Thai QR Payment</span>
                        </div>

                        {/* Instruction */}
                        <div className="mt-8 w-full space-y-4">
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start space-x-3">
                                <Info size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-amber-800 leading-relaxed">
                                    เปิดแอปธนาคารของคุณแล้วเลือกเมนู <b>"สแกน"</b> เพื่อชำระเงิน
                                </p>
                            </div>

                            <a
                                href={qrUri}
                                download="promptpay-qr.png"
                                className="w-full flex items-center justify-center space-x-2 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                            >
                                <Download size={18} />
                                <span>บันทึกรูปภาพ</span>
                            </a>
                        </div>
                    </div>

                    {/* Order Summary footer */}
                    <div className="bg-slate-50 p-6 border-t border-slate-100">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">หมายเลขคำสั่งซื้อ</span>
                            <span className="text-slate-800 font-mono font-medium">#{orderId?.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">สถานะ</span>
                            <span className="text-amber-600 font-bold flex items-center">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2"></span>
                                รอการชำระเงิน
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Assistance */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-slate-400 text-sm">
                        เมื่อชำระเงินเสร็จแล้ว ระบบจะอัปเดตสถานะอัตโนมัติภายใน 1-2 นาที
                    </p>
                    <Link
                        to="/profile/orders"
                        className="text-blue-600 font-bold hover:underline inline-flex items-center"
                    >
                        ไปหน้าคำสั่งซื้อของฉัน <ArrowLeft size={16} className="ml-1 rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchOrderMerchant } from "../service/orderService";
import MerchantDashboard from "../components/merchantDashboard/MerchantDashboard";
import type { OrderResponse } from "../interface/orderInterface";
import { convertDateUtctoTimezone } from "../utils/convertDateUtctoTimezone";
import { getImageValidate } from "../utils/getImageValidate";
import {
    LayoutDashboard,
    ShoppingBag,
    Settings,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Calendar,
    CreditCard,
    ReceiptText,
    MapPin,
    Globe,
    Store,
} from "lucide-react";
import { useNavigate } from "react-router";

type TabId = "dashboard" | "orders" | "settings";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

type OrderFilter = "ALL" | "PENDING" | "PAID" | "CANCELLED";

export default function MerchantProfilePage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("dashboard");
    const [orderFilter, setOrderFilter] = useState<OrderFilter>("ALL");

    const { merchant } = useSelector((state: RootState) => state.merchant);
    const { listOrderMerchant, loading: orderLoading } = useSelector(
        (state: RootState) => state.order
    );

    // Fetch merchant orders when Orders tab is selected
    useEffect(() => {
        if (activeTab === "orders") {
            dispatch(fetchOrderMerchant());
        }
    }, [activeTab, dispatch]);

    if (!merchant) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-gray-400">ไม่พบข้อมูลร้านค้า</p>
            </div>
        );
    }

    const orders = listOrderMerchant || [];
    const filteredOrders =
        orderFilter === "ALL"
            ? orders
            : orders.filter((o) => o.status === orderFilter);

    return (
        <div className="min-h-screen bg-main pb-12">
            {/* ── Hero Banner ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {merchant.logoUrl ? (
                            <img
                                src={getImageValidate(merchant.logoUrl.url)}
                                alt={merchant.name}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                                <Store className="w-9 h-9 text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-black text-gray-900 truncate">
                                {merchant.name}
                            </h1>
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                {merchant.description || "ยังไม่มีคำอธิบายร้านค้า"}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-semibold">
                                    <Calendar size={12} />
                                    สมาชิกเมื่อ{" "}
                                    {new Date(merchant.createdAt).toLocaleDateString("th-TH")}
                                </span>
                                {merchant.address && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">
                                        <MapPin size={12} />
                                        {merchant.address.province}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-1 -mb-px overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* ─── Dashboard Tab ─── */}
                {activeTab === "dashboard" && (
                    <MerchantDashboard merchant={merchant} />
                )}

                {/* ─── Orders Tab ─── */}
                {activeTab === "orders" && (
                    <div className="space-y-6">
                        {/* Filter buttons */}
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    { id: "ALL", label: "ทั้งหมด" },
                                    { id: "PENDING", label: "รอชำระ" },
                                    { id: "PAID", label: "จ่ายแล้ว" },
                                    { id: "CANCELLED", label: "ยกเลิก" },
                                ] as { id: OrderFilter; label: string }[]
                            ).map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setOrderFilter(f.id)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${orderFilter === f.id
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-surface text-content border border-border-main hover:bg-hover"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Loading */}
                        {orderLoading && (
                            <div className="flex justify-center py-16">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                            </div>
                        )}

                        {/* Empty */}
                        {!orderLoading && filteredOrders.length === 0 && (
                            <div className="bg-surface rounded-xl shadow-sm p-5 border border-border-main">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ReceiptText className="text-gray-300" size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    ยังไม่มีคำสั่งซื้อ
                                </h3>
                                <p className="text-gray-500 mt-1">
                                    {orderFilter === "ALL"
                                        ? "เมื่อลูกค้าสั่งซื้อสินค้า รายการจะแสดงที่นี่"
                                        : "ไม่พบคำสั่งซื้อในสถานะนี้"}
                                </p>
                            </div>
                        )}

                        {/* Order List */}
                        {!orderLoading && filteredOrders.length > 0 && (
                            <div className="space-y-4">
                                {filteredOrders.map((order: OrderResponse) => (
                                    <div
                                        key={order.id}
                                        className="bg-surface rounded-xl p-4 border border-border-main hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() =>
                                            navigate(`/profile/orders/${order.id}`)
                                        }
                                    >
                                        <div className="p-5 md:p-6">
                                            {/* Top: Order ID + Status */}
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-50">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                        Order ID
                                                    </p>
                                                    <p className="font-mono text-sm font-bold text-gray-700">
                                                        #{order.id?.slice(0, 8).toUpperCase()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MerchantStatusBadge status={order.status} />
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <Calendar size={12} className="text-gray-400" />
                                                        <p className="text-xs font-medium">
                                                            {order.invoice?.paidAt
                                                                ? convertDateUtctoTimezone(order.invoice.paidAt)
                                                                : order.createdAt
                                                                    ? convertDateUtctoTimezone(
                                                                        order.createdAt as string
                                                                    )
                                                                    : "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle: Items + Total */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-gray-50 p-3 rounded-2xl text-gray-400">
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            สินค้า (
                                                            {order.subOrders?.reduce(
                                                                (acc, sub) =>
                                                                    acc + (sub.orderItems?.length || 0),
                                                                0
                                                            ) || 0}{" "}
                                                            รายการ)
                                                        </p>
                                                        {order.receiverName && (
                                                            <p className="text-sm text-gray-500">
                                                                ผู้รับ: {order.receiverName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                        ยอดรวม
                                                    </p>
                                                    <p className="text-xl font-black text-blue-600">
                                                        ฿{order.totalPrice?.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bottom: Payment + Detail Link */}
                                            <div className="mt-5 flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                                    <CreditCard size={14} />
                                                    <span>
                                                        ชำระผ่าน: {order.invoice?.paymentMethod || "N/A"}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        navigate(`/profile/orders/${order.id}`)
                                                    }
                                                    className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
                                                >
                                                    ดูรายละเอียด <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Settings Tab ─── */}
                {activeTab === "settings" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 space-y-8">
                            {/* Store Info */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    ข้อมูลร้านค้า
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    รายละเอียดร้านค้าของคุณ
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            ชื่อร้านค้า
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium border border-gray-100">
                                            {merchant.name}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Merchant ID
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500 font-mono text-sm border border-gray-100 truncate">
                                            {merchant.id}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            คำอธิบายร้านค้า
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 border border-gray-100 min-h-15">
                                            {merchant.description || (
                                                <span className="text-gray-400 italic">
                                                    ยังไม่มีคำอธิบาย
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-600" />
                                    ที่อยู่ร้านค้า
                                </h3>

                                {merchant.address ? (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            {
                                                label: "รายละเอียด",
                                                value: merchant.address.detail,
                                            },
                                            {
                                                label: "ตำบล/แขวง",
                                                value: merchant.address.subDistrict,
                                            },
                                            {
                                                label: "อำเภอ/เขต",
                                                value: merchant.address.district,
                                            },
                                            {
                                                label: "จังหวัด",
                                                value: merchant.address.province,
                                            },
                                            {
                                                label: "รหัสไปรษณีย์",
                                                value: merchant.address.postcode,
                                            },
                                        ].map((field) => (
                                            <div key={field.label} className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    {field.label}
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 border border-gray-100">
                                                    {field.value || "-"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center gap-3 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Globe className="text-gray-300" size={24} />
                                        <p className="text-gray-400">ยังไม่ได้ระบุที่อยู่ร้านค้า</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Status Badge ── */
function MerchantStatusBadge({ status }: { status: string }) {
    switch (status) {
        case "PAID":
            return (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                    <CheckCircle2 size={12} /> จ่ายแล้ว
                </span>
            );
        case "CANCELLED":
            return (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200 flex items-center gap-1">
                    <XCircle size={12} /> ยกเลิก
                </span>
            );
        default:
            return (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                    <Clock size={12} /> รอชำระ
                </span>
            );
    }
}

import { Store, ShoppingBag, Truck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCheckoutItemsByMerchant, updateMerchantShipping } from '../services/checkoutService';
import CheckoutItemCard from './CheckoutItemCard';
import type { AppDispatch, RootState } from '../../../store';
import type { ShippingMethod } from '../interfaces/checkoutInterface';
import { formatCurrency } from '../../../common/utils/formatOrder';

export default function CheckoutItemsList() {
    const dispatch = useDispatch<AppDispatch>();
    const merchantGroups = useSelector(selectCheckoutItemsByMerchant);
    const { availableShippingMethods } = useSelector((state: RootState) => state.checkout);

    // ปรับเป็นรับ merchantId แทน productId เพื่ออัปเดตทั้งกลุ่มร้านค้า
    const handleMerchantShippingChange = (merchantId: string, method: ShippingMethod) => {
        dispatch(updateMerchantShipping({
            merchantId,
            shippingMethod: method
        }));
    };

    if (merchantGroups.length === 0) return null;

    return (
        <section className="bg-surface rounded-2xl shadow-sm border border-border-main p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-content flex items-center gap-2 mb-6">
                <ShoppingBag className="text-primary" size={20} />
                รายการสินค้าและการจัดส่ง
            </h2>

            <div className="space-y-6">
                {merchantGroups.map((group) => {
                    // หาว่าในกลุ่มนี้มีการเลือก Shipping หรือยัง (อิงจากสินค้าตัวแรกในกลุ่ม)
                    const selectedMethodId = group.items[0]?.selectedShipping?.id;
                    const isDigitalGroup = group.items.every(item => item.isDigital);

                    return (
                        <div key={group.merchantId} className="border border-border-main/60 rounded-xl p-4 bg-muted/5">
                            {/* Merchant Header */}
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-main/40">
                                <Store size={16} className="text-muted" />
                                <span className="text-sm font-bold text-content uppercase tracking-wider">
                                    {group.merchantName}
                                </span>
                            </div>

                            {/* 1. รายการสินค้าในร้านนี้ */}
                            <div className="space-y-4 mb-6">
                                {group.items.map(item => (
                                    <CheckoutItemCard key={item.id} item={item} />
                                ))}
                            </div>

                            {/* 2. ส่วนเลือกขนส่งของร้านนี้ (แสดงครั้งเดียวต่อ 1 ร้านค้า) */}
                            {!isDigitalGroup && (
                                <div className="mt-4 p-4 bg-surface rounded-xl border border-dashed border-border-main">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Truck size={16} className="text-primary" />
                                            <span className="text-xs font-black text-content uppercase tracking-widest">
                                                Shipping Option
                                            </span>
                                        </div>
                                        {selectedMethodId && (
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                                Selected
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {availableShippingMethods.map((method) => {
                                            const isSelected = selectedMethodId === method.id;
                                            // คำนวณยอดรวมของร้านนี้เพื่อเช็ค Free Shipping
                                            const merchantTotal = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                            const isFree = method.freeShippingThreshold !== null && merchantTotal >= method.freeShippingThreshold;
                                            const priceDisplay = isFree ? 'FREE' : formatCurrency(method.price);

                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => handleMerchantShippingChange(group.merchantId, method)}
                                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                                        ? 'border-primary bg-primary-light/10 ring-1 ring-primary'
                                                        : 'border-border-main bg-white hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-muted'
                                                            }`}>
                                                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-content'}`}>
                                                                {method.name}
                                                            </p>
                                                            <p className="text-[10px] text-muted">{method.estimatedDays}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs font-bold ${isFree ? 'text-emerald-600' : 'text-content'}`}>
                                                        {priceDisplay}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

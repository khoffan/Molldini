import { useDispatch, useSelector } from 'react-redux';
import { Truck } from 'lucide-react';
import type { AppDispatch, RootState } from '../../store';
import { updateItemShipping } from '../../service/checkoutService';
import type { LineItem, ShippingMethod } from '../../interface/checkoutInterface';
import { formatCurrency } from '../../utils/formatOrder';

interface CheckoutItemCardProps {
    item: LineItem;
}

export default function CheckoutItemCard({ item }: CheckoutItemCardProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { availableShippingMethods } = useSelector((state: RootState) => state.checkout);

    const handleShippingChange = (method: ShippingMethod) => {
        dispatch(updateItemShipping({
            productId: item.productId,
            shippingMethod: method
        }));
    };

    return (
        <div className="relative border border-border-main/50 rounded-xl overflow-hidden bg-surface transition-shadow hover:shadow-sm">
            {/* Loading Overlay */}
            {item.isCalculating && (
                <div className="absolute inset-0 z-10 bg-surface/50 backdrop-blur-[1px] flex justify-center items-center">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            )}

            {/* Product Info section */}
            <div className="flex gap-4 p-4 border-b border-border-main/40">
                <div className="w-16 h-16 bg-main rounded-lg border border-border-main shrink-0 overflow-hidden">
                    <img
                        src={item.image}
                        className="w-full h-full object-contain mix-blend-multiply"
                        alt={item.title}
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-semibold text-content truncate mb-0.5">{item.title}</p>
                        {item.sku && <p className="text-[11px] text-muted font-mono">SKU: {item.sku}</p>}
                    </div>
                    <div className="flex justify-between items-end mt-1">
                        <p className="text-xs font-semibold text-muted bg-main px-2 py-0.5 rounded-md">
                            Qly: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-content">{formatCurrency(item.price)}</p>
                    </div>
                </div>
            </div>

            {/* Shipping Options Section (Hybrid UI integrated into the item) */}
            {!item.isDigital && (
                <div className="p-4 bg-muted/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Truck size={14} className="text-primary" />
                        <span className="text-xs font-bold text-content uppercase tracking-wider">
                            Choose Shipping Method
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableShippingMethods.map((method) => {
                            const isSelected = item.selectedShipping?.id === method.id;
                            const isFree = method.freeShippingThreshold !== null && (item.price * item.quantity) >= method.freeShippingThreshold;
                            const priceDisplay = isFree ? 'FREE' : formatCurrency(method.price);

                            return (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleShippingChange(method);
                                    }}
                                    className={`relative flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-200 ${isSelected
                                            ? 'border-primary bg-primary-light/20 ring-1 ring-primary/50 shadow-sm'
                                            : 'border-border-main bg-surface hover:border-border-main/80 hover:bg-main/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-primary bg-primary' : 'border-muted bg-surface'
                                            }`}>
                                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-primary' : 'text-content'}`}>
                                                {method.name}
                                            </p>
                                            <p className="text-[10px] text-muted mt-0.5">{method.estimatedDays}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold shrink-0 ml-2 ${isFree ? 'text-emerald-600' : 'text-content'}`}>
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
}

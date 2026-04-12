import type { LineItem } from '../interfaces/checkoutInterface';
import { formatCurrency } from '../../../common/utils/formatOrder';

interface CheckoutItemCardProps {
    item: LineItem;
}

export default function CheckoutItemCard({ item }: CheckoutItemCardProps) {
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
        </div>
    );
}

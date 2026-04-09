import { Store, ShoppingBag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCheckoutItemsByMerchant } from '../../service/checkoutService';
import CheckoutItemCard from './CheckoutItemCard';

export default function CheckoutItemsList() {
    const merchantGroups = useSelector(selectCheckoutItemsByMerchant);

    if (merchantGroups.length === 0) return null;

    return (
        <section className="bg-surface rounded-2xl shadow-sm border border-border-main p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-content flex items-center gap-2 mb-6">
                <ShoppingBag className="text-primary" size={20} />
                รายการสินค้าและการจัดส่ง
            </h2>
            
            <div className="space-y-6">
                {merchantGroups.map((group) => (
                    <div key={group.merchantId} className="border border-border-main/60 rounded-xl p-4 bg-muted/5">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-main/40">
                            <Store size={16} className="text-muted" />
                            <span className="text-sm font-bold text-content uppercase tracking-wider">
                                {group.merchantName}
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {group.items.map(item => (
                                <CheckoutItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../service/productService';
import CategoryTag from '../components/categoryTag';
import { getImageValidate } from '../utils/getImageValidate';
import { Store } from 'lucide-react';

export default function ProductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const { items, loading, error } = useSelector((state: RootState) => state.product);
  const { categories } = useSelector((state: RootState) => state.category);
  const filterProductByCategory = useMemo(() => {
    if (!selectedCat) return items;
    return items.filter((item) => item.categoryId === selectedCat);
  }, [selectedCat, items]);

  const handleMerchantPage = (e: React.MouseEvent, merchantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/merchant/product/${merchantId}`);
  }

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error) return <div className="p-20 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-start">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Featured Collection</h1>
          <p className="mt-4 text-gray-600">ค้นพบสินค้าที่ตอบโจทย์สไตล์ในแบบของคุณ</p>
        </header>

        <CategoryTag categories={categories} selectedId={selectedCat} onSelect={(value) => setSelectedCat(value)} />

        <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filterProductByCategory.map((product) => {
            // เลือก Variant ตัวแรกเป็นค่าเริ่มต้น หรือตัวที่ราคาถูกที่สุด
            const defaultVariant = product.variants?.[0];
            const hasMultipleVariants = product.variants && product.variants.length > 1;

            return (
              <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100">
                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={getImageValidate(product?.images?.[0]?.url)}
                    alt={product.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // ถ้า Link หลักตาย ให้เปลี่ยนเป็น Link สำรอง (Fallback Link)
                      target.src = "https://placehold.co/400x500?text=Image+Error";
                    }}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {hasMultipleVariants && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                      <p className="text-[10px] font-bold uppercase text-gray-600">
                        {product.variants.length} Options
                      </p>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-auto">
                    <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">{product.category?.name || 'General'}</p>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-3">
                      {product.title}
                    </h3>

                    <button onClick={(e) => handleMerchantPage(e, product.merchantId!)} className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50 cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                        {product.merchant?.logoUrl ? (
                          <img src={product.merchant.logoUrl.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Store size={12} className="text-gray-400" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-medium truncate">
                        {product.merchant?.name || 'Molldini Official'}
                      </span>
                    </button>
                  </div>

                  {/* Variants Preview (แสดงจุดสีหรือขนาดคร่าวๆ) */}
                  <div className="mt-4 flex gap-2">
                    {product.variants?.slice(0, 4).map((v) => (
                      <div key={v.id} className="w-4 h-4 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-[8px] font-bold">
                        {v.sku?.[0]}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Starting from</p>
                      <p className="text-xl font-black text-gray-900">
                        ฿{defaultVariant?.price.toLocaleString() ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
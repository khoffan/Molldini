import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../services/productService';
import CategoryTag from '../components/categoryTag';
import LoadingSkelition from '../../../common/components/loadingComponent/LoadingShrinkBoxSkelition';
import { fetchCategories } from '../../../features/products/services/categoryService';
import { ProductContent } from '../components/ProductContent';
import ProductEmpty from '../components/ProductEmpty';

export default function ProductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const { items, loading, error } = useSelector((state: RootState) => state.product);
  const { categories } = useSelector((state: RootState) => state.category);
  const filterProductByCategory = useMemo(() => {
    if (!selectedCat) return items;
    return items.filter((item) => item.categoryId === selectedCat);
  }, [selectedCat, items]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // 1. ระหว่างโหลดข้อมูล
  if (loading && items.length === 0) {
    return <LoadingSkelition />;
  }

  // 2. กรณีเกิด Error จาก Server (เช่น Render.com ขัดข้อง)
  if (error) {
    return (
      <div className="container mx-auto py-20">
        <ProductEmpty
          status="error"
          message={error}
          onRetry={() => dispatch(fetchProducts())}
        />
      </div>
    );
  }

  // 3. กรณีโหลดเสร็จแล้วแต่ไม่มีสินค้าในระบบเลย
  if (!loading && items.length === 0) {
    return (
      <div className="container mx-auto py-20">
        <ProductEmpty
          status="empty"
          message="ขออภัย ขณะนี้ยังไม่มีสินค้าพร้อมจำหน่าย กรุณาแวะมาชมใหม่ภายหลัง"
        />
      </div>
    );
  }

  return (
    <div className="bg-main min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-start">
          <h1 className="text-4xl font-extrabold text-content tracking-tight">Featured Collection</h1>
          <p className="mt-4 text-muted">ค้นพบสินค้าที่ตอบโจทย์สไตล์ในแบบของคุณ</p>
        </header>
        <>
          <CategoryTag categories={categories} selectedId={selectedCat} onSelect={(value) => setSelectedCat(value)} />
          <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filterProductByCategory.map((product, index) => {
              return <ProductContent key={product.id} product={product} index={index} />
            })}
          </div>
        </>
      </div>
    </div>
  );
}

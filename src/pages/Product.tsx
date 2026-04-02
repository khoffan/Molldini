import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../service/productService';
import CategoryTag from '../components/categoryTag';
import LoadingSkelition from '../components/loadingComponent/LoadingShrinkBoxSkelition';
import { fetchCategories } from '../service/categoryService';
import { ProductContent } from '../components/product/ProductContent';

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

  if (error) return <div className="p-20 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-main min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-start">
          <h1 className="text-4xl font-extrabold text-content tracking-tight">Featured Collection</h1>
          <p className="mt-4 text-muted">ค้นพบสินค้าที่ตอบโจทย์สไตล์ในแบบของคุณ</p>
        </header>

        {loading ? (
          <>
            <LoadingSkelition />
          </>
        ) : (
          <>
            <CategoryTag categories={categories} selectedId={selectedCat} onSelect={(value) => setSelectedCat(value)} />

            <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filterProductByCategory.map((product) => {
                return <ProductContent key={product.id} product={product} />
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
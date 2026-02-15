import type { Category } from "../interface/categoryInterface";

interface CategoryTagProps {
    categories: Category[];
    selectedId: string | null; // null คือเลือก "ทั้งหมด"
    onSelect: (id: string | null) => void;
}

export default function CategoryTag({ categories, selectedId, onSelect }: CategoryTagProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {/* ปุ่ม All สำหรับล้าง Filter */}
            <button
                onClick={() => onSelect(null)}
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${selectedId === null
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                    }`}
            >
                ทั้งหมด
            </button>

            {/* Loop แสดงหมวดหมู่จาก Props */}
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${selectedId === cat.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}

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
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-surface border-border-main text-muted hover:border-content/30'
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
                        ? 'bg-primary border-primary text-white shadow-md'
                        : 'bg-surface border-border-main text-muted hover:border-content/30'
                        }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}

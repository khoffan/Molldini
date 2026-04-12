import { useRef } from "react";
import type { Category } from "../interfaces/categoryInterface";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryTagProps {
    categories: Category[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

export default function CategoryTag({ categories, selectedId, onSelect }: CategoryTagProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            const currentScroll = scrollRef.current.scrollLeft;
            const newScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;
            scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
        }
    }

    return (
        <div className="relative group flex items-center"> {/* เพิ่ม wrapper เพื่อทำ gradient */}
            {/* ปุ่มเลื่อนซ้าย */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 z-10 p-1 mb-4 bg-main/80 dark:bg-content/50 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block border border-border-main"
            >
                <ChevronLeft size={20} className="text-main" />
            </button>
            <div
                ref={scrollRef}
                className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide transition-all">
                {/* ปุ่ม All */}
                <button
                    onClick={() => onSelect(null)}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${selectedId === null
                        ? 'bg-primary border-primary text-white shadow-lg scale-105'
                        : 'bg-surface border-border-main text-muted hover:border-primary/50'
                        }`}
                >
                    ทั้งหมด
                </button>

                {/* Loop categories */}
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${selectedId === cat.id
                            ? 'bg-primary border-primary text-white shadow-lg scale-105'
                            : 'bg-surface border-border-main text-muted hover:border-primary/50'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* ปุ่มเลื่อนขวา */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 z-10 p-1 mb-4 bg-main/80 dark:bg-content/50 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block border border-border-main"
            >
                <ChevronRight size={20} className="text-main" />
            </button>


        </div>
    );
}

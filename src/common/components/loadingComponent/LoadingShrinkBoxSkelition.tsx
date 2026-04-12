interface LoadingSkeletonProps {
  type?: "grid" | "list"; // เลือกรูปแบบ Layout
  count?: number; // จำนวนกล่องที่ต้องการแสดง
  showHeader?: boolean; // จะแสดงหัวข้อ (Title) หรือไม่
  className?: string; // สำหรับปรับแต่ง margin/padding เพิ่มเติม
}

function LoadingSkelition({
  type = "grid",
  count = 6,
  showHeader = true,
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 ${className}`}>
      {/* 1. Header Skeleton (แสดงเฉพาะเมื่อต้องการ) */}
      {showHeader && (
        <div className="mb-10 text-center space-y-4">
          <div className="h-10 w-48 md:w-64 bg-surface-hover rounded-2xl mx-auto animate-pulse"></div>
          <div className="h-4 w-64 md:w-96 bg-surface-hover rounded-lg mx-auto animate-pulse"></div>
        </div>
      )}

      {/* 2. Dynamic Content Area */}
      <div
        className={
          type === "grid"
            ? "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-4 max-w-2xl mx-auto"
        }
      >
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`bg-surface border border-border-main overflow-hidden shadow-sm animate-pulse ${type === "grid" ? "rounded-[2rem]" : "rounded-2xl flex items-center p-4 gap-4"}`}
          >
            {type === "grid" ? (
              // --- Layout แบบ Grid (Product Card) ---
              <>
                <div className="h-64 bg-surface-hover"></div>
                <div className="p-6 space-y-4">
                  <div className="h-3 w-20 bg-surface-hover rounded-full"></div>
                  <div className="h-6 w-full bg-surface-hover rounded-lg"></div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-8 w-24 bg-surface-hover rounded-xl"></div>
                    <div className="h-10 w-28 bg-surface-hover rounded-xl"></div>
                  </div>
                </div>
              </>
            ) : (
              // --- Layout แบบ List (Profile Actions / Settings) ---
              <>
                <div className="h-12 w-12 bg-surface-hover rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-hover rounded-md"></div>
                  <div className="h-3 w-48 bg-surface-hover rounded-md opacity-60"></div>
                </div>
                <div className="h-6 w-6 bg-surface-hover rounded-full shrink-0"></div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkelition;

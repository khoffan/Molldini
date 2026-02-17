function LoadingSkelition() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Header Skeleton */}
            <div className="mb-10 text-center space-y-4">
                <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
                <div className="h-4 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        {/* Image area */}
                        <div className="h-72 bg-gray-200 animate-pulse"></div>
                        {/* Content area */}
                        <div className="p-6 space-y-4">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                            <div className="flex justify-between items-center pt-4">
                                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LoadingSkelition;

function LoadingCircularSkelition() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            {/* Spinner */}
            <div className="relative w-16 h-16">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
                {/* Spinning gradient arc */}
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-indigo-500 animate-spin" />
                {/* Inner glow dot */}
                <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 animate-pulse" />
                </div>
            </div>
            {/* Loading text */}
            <div className="flex flex-col items-center gap-1.5">
                <p className="text-sm font-medium text-gray-600 tracking-wide">Loading</p>
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
}

export default LoadingCircularSkelition;

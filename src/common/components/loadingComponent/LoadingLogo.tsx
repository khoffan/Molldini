import { motion } from 'framer-motion';

const LoadingLogoScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
            {/* Container สำหรับ Logo และ Animation */}
            <div className="relative flex flex-col items-center">

                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [0.8, 1.1, 1],
                        opacity: 1
                    }}
                    transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    className="mb-8"
                >
                    <img
                        src="/logo.svg"
                        alt="App Logo"
                        className="w-32 h-32 md:w-40 md:h-40 object-contain"
                    />
                </motion.div>

                {/* Loading Progress Bar (Optional) */}
                <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-blue-600" // ปรับสีตาม Brand ของคุณ
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                {/* Text Fade-in */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-4 text-sm font-medium text-gray-500 tracking-widest uppercase"
                >
                    Loading Assets...
                </motion.p>
            </div>
        </div>
    );
};

export default LoadingLogoScreen;
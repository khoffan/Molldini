import { Link } from 'react-router'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-main flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8 transition-colors duration-300">
            <div className="text-center relative">
                {/* Background Blur Effect */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                {/* 404 Content */}
                <div className="relative">
                    <p className="text-9xl font-black text-primary/10 select-none">404</p>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <h1 className="text-4xl font-bold tracking-tight text-content sm:text-6xl">
                            Oops! Lost in Space?
                        </h1>
                    </div>
                </div>

                <p className="mt-6 text-lg leading-7 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    ขออภัยครับ เราไม่พบหน้าที่คุณกำลังตามหา
                    อาจเป็นไปได้ว่าหน้าเว็บถูกย้าย หรือ URL ไม่ถูกต้อง
                </p>

                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        to="/"
                        className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        Back to Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="text-sm font-semibold text-content hover:text-primary transition-colors flex items-center gap-2"
                    >
                        <span>&larr;</span> Go Back
                    </button>
                </div>

                {/* Decorative Element for E-commerce context */}
                <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-none text-left opacity-60">
                    <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-2xl">
                        <h3 className="font-semibold text-content">Looking for products?</h3>
                        <p className="text-sm">ลองไปดูสินค้าใหม่ล่าสุดที่หน้าหลักของเราสิ!</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-2xl">
                        <h3 className="font-semibold text-content">Need Help?</h3>
                        <p className="text-sm">ติดต่อฝ่ายสนับสนุนลูกค้าได้ตลอด 24 ชม.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
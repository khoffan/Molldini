export default function PolicyPage() {
    return (
        // Container หลัก: กำหนดพื้นหลังและระยะห่างบน-ล่าง
        <div className="bg-surface min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">

            {/* Card Layout: จำกัดความกว้าง และจัดให้อยู่กึ่งกลาง */}
            <article className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-border-main p-8 md:p-12">

                {/* Header Section */}
                <header className="border-b border-border-main pb-8 mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-content mb-4 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-muted font-medium italic">
                        Last updated: February 24, 2026
                    </p>
                </header>

                {/* Content Section: ใช้ Tailwind Typography (prose) หรือ custom classes */}
                <div className="space-y-6 text-content leading-relaxed">

                    <section className="bg-primary/5 p-6 rounded-2xl border-l-4 border-primary mb-8">
                        <p className="text-sm md:text-base text-content/80">
                            This Privacy Policy describes Our policies and procedures on the collection,
                            use and disclosure of Your information when You use the Service and tells
                            You about Your privacy rights and how the law protects You.
                        </p>
                    </section>

                    <p>
                        We use Your Personal Data to provide and improve the Service. By using the Service,
                        You agree to the collection and use of information in accordance with this Privacy Policy.
                    </p>

                    <h2 className="text-2xl font-bold text-content pt-4 border-t border-border-main/50">
                        Interpretation and Definitions
                    </h2>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-primary">Interpretation</h3>
                        <p className="text-muted text-sm md:text-base">
                            The words whose initial letters are capitalized have meanings defined under the following conditions...
                        </p>

                        <h3 className="text-lg font-bold text-primary">Definitions</h3>
                        <ul className="grid gap-4 list-none">
                            {[
                                { title: "Account", desc: "Means a unique account created for You to access our Service." },
                                { title: "Company", desc: "Refers to Molldini (referred to as We, Us or Our)." },
                                { title: "Cookies", desc: "Small files placed on Your device by a website." },
                                { title: "Personal Data", desc: "Any information that relates to an identified individual." }
                            ].map((item, index) => (
                                <li key={index} className="bg-surface-hover p-4 rounded-xl border border-border-main/50">
                                    <strong className="text-content block mb-1">{item.title}</strong>
                                    <span className="text-sm text-muted leading-snug">{item.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold text-content pt-8">Collecting and Using Your Personal Data</h2>

                    <div className="bg-white border border-border-main rounded-2xl overflow-hidden mt-4">
                        <div className="p-4 bg-surface font-bold text-sm uppercase tracking-widest text-muted border-b border-border-main">
                            Types of Data Collected
                        </div>
                        <div className="p-6 space-y-4">
                            <h4 className="font-bold text-primary italic">Personal Data</h4>
                            <p className="text-sm italic">Includes but is not limited to: Email address</p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <footer className="mt-12 pt-8 border-t-2 border-dashed border-border-main">
                        <h2 className="text-2xl font-bold text-content mb-4">Contact Us</h2>
                        <p className="mb-4">If you have any questions about this Privacy Policy, You can contact us:</p>
                        <a
                            href="mailto:khoffan222@gmail.com"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors shadow-md"
                        >
                            khoffan222@gmail.com
                        </a>
                    </footer>
                </div>
            </article>
        </div>
    );
}
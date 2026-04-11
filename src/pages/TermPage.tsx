export default function TermPage() {
    return (
        <div className="bg-surface min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">

            {/* Article Container */}
            <article className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-border-main p-8 md:p-12">

                {/* Header Section */}
                <header className="border-b border-border-main pb-8 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            Legal Document
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-content mb-3 tracking-tight">
                        Terms and Conditions
                    </h1>
                    <p className="text-sm text-muted font-medium italic">
                        Last updated: February 24, 2026
                    </p>
                </header>

                <div className="space-y-8 text-content leading-relaxed">

                    <section className="prose prose-slate">
                        <p className="text-lg font-medium text-content/80">
                            Please read these terms and conditions carefully before using Our Service.
                        </p>
                    </section>

                    {/* Interpretation & Definitions Section */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-content flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-sm">01</span>
                            Interpretation and Definitions
                        </h2>

                        <div className="pl-10 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-primary mb-2">Interpretation</h3>
                                <p className="text-muted text-sm md:text-base">
                                    The words whose initial letters are capitalized have meanings defined under the following conditions...
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-primary mb-4">Definitions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { t: "Affiliate", d: "Entity that controls or is under common control with a party." },
                                        { t: "Company", d: "Refers to Molldini (referred to as We, Us or Our)." },
                                        { t: "Service", d: "Refers to the Molldini Website." },
                                        { t: "You", d: "The individual accessing or using the Service." }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-surface-hover p-4 rounded-2xl border border-border-main/50 hover:border-primary/30 transition-colors">
                                            <strong className="text-content block text-sm mb-1">{item.t}</strong>
                                            <p className="text-xs text-muted leading-relaxed">{item.d}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Acknowledgment Section */}
                    <section className="space-y-4 border-t border-border-main pt-8">
                        <h2 className="text-2xl font-bold text-content flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-sm">02</span>
                            Acknowledgment
                        </h2>
                        <div className="pl-10 space-y-4 text-content/90">
                            <p>By accessing or using the Service You agree to be bound by these Terms and Conditions.</p>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <p className="text-sm font-bold text-primary">
                                    ⚠️ You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Limitation of Liability - ทำให้ดูเด่นและสำคัญ */}
                    <section className="space-y-4 bg-content text-white p-8 rounded-3xl shadow-inner">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">03</span>
                            Limitation of Liability
                        </h2>
                        <div className="pl-10 space-y-4 text-white/80 text-sm md:text-base leading-relaxed">
                            <p>
                                Notwithstanding any damages that You might incur, the entire liability of the Company...
                                shall be limited to the amount actually paid by You or 100 USD.
                            </p>
                            <p className="italic border-l-2 border-white/20 pl-4">
                                To the maximum extent permitted by applicable law, in no event shall the Company be liable for any special, incidental, or indirect damages...
                            </p>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <footer className="mt-12 pt-10 border-t border-border-main text-center">
                        <h2 className="text-xl font-bold text-content mb-6">Have questions about our Terms?</h2>
                        <a
                            href="mailto:khoffan222@gmail.com"
                            className="inline-flex items-center justify-center bg-primary text-white w-full md:w-auto px-10 py-4 rounded-full font-black hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                        >
                            Contact Support Team
                        </a>
                        <p className="mt-6 text-xs text-muted">
                            Legal inquiries: khoffan222@gmail.com
                        </p>
                    </footer>
                </div>
            </article>
        </div>
    );
}
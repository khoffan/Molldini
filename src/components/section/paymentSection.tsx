import { CreditCard, QrCode, Truck, Wallet } from 'lucide-react';


interface PaymentProps {
    selectedMethod: string;
    onMethodChange: (value: string) => void;
}

export const PaymentSection = ({ selectedMethod, onMethodChange }: PaymentProps) => {
    const methods = [
        { id: 'PROMPTPAY', title: 'PromptPay', icon: <QrCode />, desc: 'สแกน QR Code เพื่อชำระเงิน' },
        { id: 'CREDIT_CARD', title: 'บัตรเครดิต/เดบิต', icon: <CreditCard />, desc: 'Visa, Mastercard, JCB' },
        { id: 'COD', title: 'เก็บเงินปลายทาง', icon: <Truck />, desc: 'ชำระเงินเมื่อได้รับสินค้า' },
        { id: 'WALLET', title: 'TrueMoney Wallet', icon: <Wallet />, desc: 'ชำระผ่านแอป TrueMoney' },
    ];

    return (
        <section className="bg-surface p-8 rounded-2xl shadow-sm border border-border-main">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                วิธีการชำระเงิน
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {methods.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => onMethodChange(method.id)}
                        className={`
                            relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                            ${selectedMethod === method.id
                                ? 'border-primary bg-primary-light'
                                : 'border-border-main hover:border-primary/40 bg-surface'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon วงกลมเลือก */}
                            <div className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center
                                ${selectedMethod === method.id ? 'border-primary' : 'border-border-main'}
                            `}>
                                {selectedMethod === method.id && (
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                )}
                            </div>

                            {/* Icon และข้อความ */}
                            <div className={`p-2 rounded-lg ${selectedMethod === method.id ? 'text-primary' : 'text-muted'}`}>
                                {method.icon}
                            </div>

                            <div>
                                <p className={`font-bold ${selectedMethod === method.id ? 'text-content' : 'text-content'}`}>
                                    {method.title}
                                </p>
                                <p className="text-xs text-muted">{method.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
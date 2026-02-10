import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { updateDataOrder } from '../service/orderService';
import { PaymentSection } from '../components/section/paymentSection';
import { useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';
import { clearCart } from '../service/cartService';

export default function CheckoutPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { order, loading } = useSelector((state: RootState) => state.order);
    console.log("Checkout for order ID:", order);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: "",
        address: '',
        city: '',
        zipCode: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<string>("PROMPTPAY");
    const total = order?.totalPrice || 0;
    const shipping = 10;
    const subtotal = total > 0 ? total - shipping : 0;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Processing order for:", formData);
        // เริ่มโชว์ Loading (ถ้าต้องการ)
        Swal.fire({
            title: 'กำลังประมวลผล...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        try {
            dispatch(clearCart());
            await dispatch(updateDataOrder({
                cartId: id || '',
                reciveAddress: {
                    address: formData.address,
                    city: formData.city,
                    zipCode: formData.zipCode,
                },
                reciveInfo: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phome: formData.phone || '',
                },
                paymentMethod: paymentMethod,
            }));

            // 2. ถ้าสำเร็จ ปิด Loading และโชว์ Success
            await Swal.fire({
                icon: 'success',
                title: 'สั่งซื้อสำเร็จ!',
                text: 'ขอบคุณที่ใช้บริการ เรากำลังเตรียมจัดส่งสินค้าให้คุณ',
                timer: 2000, // โชว์ 2 วินาทีแล้วปิดเอง
                showConfirmButton: false
            });

            // 3. Navigate กลับหน้าแรก
            navigate('/');
        } catch (err: unknown) {
            // 4. ถ้าพัง โชว์ Error
            if (err instanceof Error) {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: err.message || 'ไม่สามารถสร้างออเดอร์ได้ กรุณาลองใหม่',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถสร้างออเดอร์ได้ กรุณาลองใหม่',
                });
            }

        }
        // ต่อไป: ยิง API สร้าง Order และตัดสต็อก
    };

    // useEffect(() => {
    //     dispatch(fetchCartFromDb());
    // }, [dispatch]);

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-10">Checkout</h1>

                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
                    {/* ฝั่งซ้าย: ข้อมูลผู้รับและการชำระเงิน */}
                    <div className="flex-1 space-y-8">
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="email" name="email" placeholder="Email Address"
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={handleInputChange} required
                                />
                                <input
                                    type="phone" name="phone" placeholder="Phone Number"
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={handleInputChange} required
                                />
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                                Shipping Address
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="firstName" placeholder="First Name" className="p-3 border rounded-xl" onChange={handleInputChange} required />
                                <input type="text" name="lastName" placeholder="Last Name" className="p-3 border rounded-xl" onChange={handleInputChange} required />
                                <input type="text" name="address" placeholder="Address" className="col-span-2 p-3 border rounded-xl" onChange={handleInputChange} required />
                                <input type="text" name="city" placeholder="City" className="p-3 border rounded-xl" onChange={handleInputChange} required />
                                <input type="text" name="zipCode" placeholder="ZIP Code" className="p-3 border rounded-xl" onChange={handleInputChange} required />
                            </div>
                        </section>
                        <PaymentSection
                            selectedMethod={paymentMethod}
                            onMethodChange={(value) => setPaymentMethod(value)}
                        />

                    </div>

                    {/* ฝั่งขวา: สรุปรายการสินค้า */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            {loading ? (
                                <div className="p-20 text-center">Loading...</div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto mb-6 space-y-4 pr-2">
                                    {order?.items.map((item) => {
                                        return (
                                            <div key={item.id} className="flex gap-4">
                                                <img src={item?.image} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item?.title}</h4>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-bold text-blue-600">฿{(item?.price || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="space-y-3 border-t pt-4 mb-6 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>฿{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>฿{shipping.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl text-gray-900 pt-2 border-t">
                                    <span>Total</span>
                                    <span>฿{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Place Order Now
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">
                                Secure SSL encrypted transaction
                            </p>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}

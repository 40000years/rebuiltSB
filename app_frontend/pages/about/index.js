'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export default function AboutPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bgIndex, setBgIndex] = useState(0);
    const bgImages = ['/images/ba1.jpg', '/images/ba2.jpg', '/images/ba3.jpg'];
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0)
    const dropdownRef = useRef(null);

    useEffect(() => {
        function checkAuth() {
            const token = localStorage.getItem('jwt_access');
            if (token && !isTokenExpired(token)) {
                setIsLoggedIn(true);
            } else {
                localStorage.removeItem('jwt_access');
                setIsLoggedIn(false);
            }
        }
        checkAuth();
        const interval = setInterval(checkAuth, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function updateCount() {
            const stored = JSON.parse(localStorage.getItem('cart') || '[]')
            const total = stored.reduce((sum, i) => sum + (i.quantity || 0), 0)
            setCartCount(total)
        }
        updateCount()
        window.addEventListener('storage', updateCount)
        return () => window.removeEventListener('storage', updateCount)
    }, [])

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt_access');
        setIsLoggedIn(false);
        router.push('/');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex flex-col min-h-screen">
            <div className="absolute inset-0 z-[-1]">
                {bgImages.map((src, idx) => (
                    <Image
                        key={idx}
                        src={src}
                        alt={`Background ${idx}`}
                        fill
                        className={`object-cover transition-opacity duration-1000 ease-in-out ${idx === bgIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                ))}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
            </div>

            <header className="fixed top-0 w-full bg-[#fff8e1] shadow-md z-50">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2 relative group">
                        <Image src="/images/logo.png" width={65} height={40} alt="Logo" />
                    </Link>
                    <nav className="flex gap-6">
                        {['Home', 'About Us', 'Product'].map((text, idx) => {
                            const href = text === 'Home' ? '/' : text === 'About Us' ? '/about' : '/product-list';
                            return (
                                <Link
                                    key={idx}
                                    href={href}
                                    className="relative text-[#8b4513] font-semibold group"
                                >
                                    <span>
                                        {text}
                                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#f4d03f] group-hover:w-full transition-all duration-300"></span>
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex gap-4 items-center">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/order"
                                    className="relative p-2 border rounded-full hover:bg-[#f4d03f]"
                                >
                                    🛒
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="w-10 h-10 rounded-full overflow-hidden border hover:ring-2 ring-yellow-500 transition-all duration-200"
                                    >
                                        <Image src="/icons/user.png" alt="Profile" width={40} height={40} />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                                            <Link
                                                href="/myprofile"
                                                className="block px-4 py-2 text-yellow-700 hover:bg-gray-100"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-[#f4d03f] hover:bg-[#e6c02f] text-[#8b4513] font-bold px-4 py-2 rounded-full transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-28">
                <section className="container mx-auto px-6 py-16 bg-white/80 rounded-xl shadow-lg">
                    <h2 className="text-5xl font-extrabold text-yellow-700 text-center mb-10">About Us</h2>
                    <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
                        <strong className="text-yellow-600">Meal of Hope</strong> คือแพลตฟอร์มขายอาหารใกล้หมดอายุและผักผลไม้มีตำหนิที่ยังคงคุณค่าทางโภชนาการ <strong className="text-yellow-600">ถูกกว่า 50%!</strong> ทุกการซื้อช่วยลดขยะอาหารและสร้างพลังบวกให้สังคม
                    </p>
                    <div className="mt-16 flex justify-center flex-wrap gap-10">
                        {[
                            { letter: 'H', title: 'Human', desc: 'มื้ออาหารสำหรับมนุษย์' },
                            { letter: 'O', title: 'Opportunity', desc: 'มื้ออาหารเพื่อสร้างโอกาส' },
                            { letter: 'P', title: 'Preservation', desc: 'มื้ออาหารเพื่อการอนุรักษ์' },
                            { letter: 'E', title: 'Earth', desc: 'มื้ออาหารเพื่อโลก' }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group cursor-pointer">
                                <div className="w-36 h-36 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-5xl font-extrabold text-white shadow-2xl border-4 border-white transition-transform duration-300 group-hover:scale-105">
                                    {item.letter}
                                </div>

                                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-60 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 z-20">
                                    <div className="relative bg-white rounded-xl shadow-xl px-4 py-3 text-center text-gray-800">
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm"></div>
                                        <h4 className="font-bold text-yellow-600">{item.title}</h4>
                                        <p className="text-sm mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-yellow-50/80 py-16 mt-12">
                    <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
                        <div>
                            <h3 className="text-4xl font-bold text-yellow-600 mb-4">
                                Our Mission
                            </h3>
                            <ul className="list-disc list-inside space-y-3 text-gray-700 text-lg">
                                <li>ทุกมื้อของคุณคือการช่วยโลก – ลดขยะอาหารอย่างยั่งยืน</li>
                                <li>ส่งมอบอาหารคุณภาพราคาประหยัดให้ผู้ขาดแคลนเข้าถึงได้ง่ายขึ้น</li>
                                <li>สร้างรายได้และเสริมความเข้มแข็งให้กับเกษตรกรและชุมชนท้องถิ่น</li>
                                <li>รีไซเคิลเศษอาหารเป็นปุ๋ยและพลังงานสะอาดอย่างยั่งยืน</li>
                            </ul>
                        </div>
                        <div className="w-full h-72 relative rounded-xl overflow-hidden shadow-xl">
                            <Image src="/images/mission.jpg" alt="พันธกิจของเรา" fill className="object-cover" />
                        </div>
                    </div>
                </section>
                <section className="bg-white/90 py-12 mt-12">
                    <div className="container mx-auto px-6 text-center">
                        <h3 className="text-3xl font-bold text-yellow-700 mb-6">เสียงจากผู้ใช้งาน</h3>
                        <p className="text-gray-700 max-w-xl mx-auto italic">
                            “ประหยัดเงินได้เยอะ อาหารคุณภาพดี แถมยังรู้สึกดีที่ได้ช่วยลดขยะอาหาร”
                        </p>
                        <p className="text-sm text-gray-500 mt-2">— ผู้ใช้งานจริงจากอนาคต</p>
                    </div>
                </section>

                <section className="container mx-auto px-6 py-16 bg-yellow-50/80 mt-12 rounded-xl shadow-md">
                    <h3 className="text-4xl font-extrabold text-yellow-700 text-center mb-8">
                        ทีมงานของเรา
                    </h3>
                    <div className="flex flex-wrap justify-center gap-8">
                        {[
                            { name: 'ธนศักดิ์ ชนม์เรืองฉาย', id: '6610742410', role: 'System Analyst / Backend Developer', image: '/images/taylor.jpg' },
                            { name: 'ณัฏชนน วสุธวัช', id: '6610742279', role: 'Business Analyst / Backend Developer', image: '/images/pun.jpg' },
                            { name: 'ธนภัทร์ แย้มบู่', id: '6610742113', role: 'Frontend Developer', image: '/images/it.jpg' }
                        ].map((member, idx) => (
                            <div
                                key={idx}
                                className="w-72 bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition"
                            >
                                <div className="w-24 h-24 mx-auto mb-4 relative rounded-full overflow-hidden border-4 border-yellow-400">
                                    <Image src={member.image} alt={member.name} fill className="object-cover" />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-800">{member.name}</h4>
                                <p className="text-sm text-gray-500 mb-1">รหัส: {member.id}</p>
                                <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <footer className="bg-gray-100 py-6 mt-5">
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4].map((_, idx) => (
                        <span key={idx} className="w-4 h-4 bg-gray-400 rounded-full inline-block" />
                    ))}
                </div>
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600">
                    <span>About us</span>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="relative text-gray-600 font-medium group mt-2 sm:mt-0"
                    >
                        <span className="relative inline-block px-1">
                            Back to top ↑
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gray-500 group-hover:w-full transition-all duration-300" />
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
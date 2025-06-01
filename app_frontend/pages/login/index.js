'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [error, setError] = useState('');
    const [bgIndex, setBgIndex] = useState(0);
    const bgImages = ['/images/school-bg1.jpg', '/images/school-bg2.jpg', '/images/school-bg3.jpg'];
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    async function handleLogin(event) {
        event.preventDefault();
        setError('');

        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');

        const adminCredentials = { username: 'admin', password: 'admin1234' };

        try {
            if (username === adminCredentials.username && password === adminCredentials.password) {
                const userData = { access: 'jwt_token_admin', role: 'admin' };
                localStorage.setItem('jwt_access', userData.access);
                localStorage.setItem('user_role', userData.role);
                console.log('Login - jwt_access:', localStorage.getItem('jwt_access')); // Debug
                console.log('Login - user_role:', localStorage.getItem('user_role')); // Debug
                alert('เข้าสู่ระบบสำเร็จในฐานะผู้ดูแล!');
                // Force reload with query to track login
                window.location.href = '/dashboard?justLoggedIn=true';
            } else {
                const userData = { access: 'jwt_token_user', role: 'user' };
                localStorage.setItem('jwt_access', userData.access);
                localStorage.setItem('user_role', userData.role);
                alert('เข้าสู่ระบบสำเร็จ!');
                router.push('/');
            }
        } catch {
            setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen">
            <div className="absolute inset-0 z-[-1]">
                {bgImages.map((src, idx) => (
                    <Image
                        key={idx}
                        src={src}
                        alt={`พื้นหลัง ${idx}`}
                        fill
                        className={`object-cover transition-opacity duration-1000 ease-in-out ${idx === bgIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-blue-800/40 backdrop-blur-sm" />
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="flex flex-col items-center">
                    <Image src="/images/school-logo.png" width={80} height={80} alt="โลโก้โรงเรียน" />
                    <h2 className="mt-4 text-3xl font-extrabold text-blue-800">ยินดีต้อนรับ</h2>
                    <p className="mt-2 text-gray-600">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-blue-800">
                            ชื่อผู้ใช้
                        </label>
                        <input
                            name="username"
                            id="username"
                            type="text"
                            required
                            className="mt-1 block w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                            placeholder="ชื่อผู้ใช้ของคุณ"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-blue-800">
                            รหัสผ่าน
                        </label>
                        <input
                            name="password"
                            id="password"
                            type="password"
                            required
                            className="mt-1 block w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-200"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    ยังไม่มีบัญชี?{' '}
                    <Link href="/register" className="font-medium text-blue-600 hover:text-blue-800">
                        ลงทะเบียน
                    </Link>
                </p>
            </div>
        </div>
    );
}
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [applicationCount, setApplicationCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [applications, setApplications] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('jwt_access');
            const role = localStorage.getItem('user_role');
            console.log('Dashboard - Token:', token); // Debug
            console.log('Dashboard - Role:', role); // Debug
            if (token) {
                setIsLoggedIn(true);
                const adminStatus = role === 'admin';
                setIsAdmin(adminStatus);
                console.log('Dashboard - isAdmin:', adminStatus); // Debug
                if (!adminStatus) {
                    console.log('Redirecting to / because user is not admin');
                    router.push('/');
                } else if (searchParams.get('justLoggedIn') === 'true') {
                    router.replace('/dashboard');
                }
            } else {
                console.log('Redirecting to /login because token is missing');
                localStorage.removeItem('jwt_access');
                localStorage.removeItem('user_role');
                setIsLoggedIn(false);
                router.push('/login');
            }
        };

        const delayCheck = setTimeout(() => {
            checkAuth();
        }, 100); // Delay 100ms to ensure localStorage is ready

        return () => clearTimeout(delayCheck);
    }, [router, searchParams]);

    useEffect(() => {
        function updateCount() {
            const stored = JSON.parse(localStorage.getItem('applications') || '[]');
            setApplications(stored);
            setApplicationCount(stored.length);
        }
        updateCount();
        window.addEventListener('storage', updateCount);
        return () => window.removeEventListener('storage', updateCount);
    }, []);

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
        localStorage.removeItem('user_role');
        setIsLoggedIn(false);
        router.push('/');
    };

    if (!isAdmin) {
        return null; // Render nothing while redirecting
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <header className="fixed top-0 w-full bg-white shadow-md z-50">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2 relative group">
                        <Image src="/images/school-logo.png" width={65} height={40} alt="โลโก้โรงเรียน" />
                    </Link>
                    <nav className="flex gap-6">
                        {['หน้าแรก', 'เกี่ยวกับเรา', 'หลักสูตร'].map((text, idx) => {
                            const href = text === 'หน้าแรก' ? '/' : text === 'เกี่ยวกับเรา' ? '/about' : '/programs';
                            return (
                                <Link
                                    key={idx}
                                    href={href}
                                    className="relative text-blue-800 font-semibold group"
                                >
                                    <span>
                                        {text}
                                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 group-hover:w-full transition-all duration-300"></span>
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex gap-4 items-center">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/applications"
                                    className="relative p-2 border border-blue-800 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                >
                                    📝
                                    {applicationCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                            {applicationCount}
                                        </span>
                                    )}
                                </Link>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="w-10 h-10 rounded-full overflow-hidden border hover:ring-2 ring-blue-500 transition-all duration-200"
                                    >
                                        <Image src="/icons/user.png" alt="โปรไฟล์" width={40} height={40} />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                                            <Link
                                                href="/myprofile"
                                                className="block px-4 py-2 text-blue-700 hover:bg-blue-100"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                โปรไฟล์
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-blue-700 hover:bg-blue-100"
                                            >
                                                ออกจากระบบ
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full transition-colors duration-200"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-16">
                <section className="container mx-auto px-6 py-16">
                    <h2 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">แดชบอร์ดสำหรับผู้ดูแล</h2>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-blue-800">รายชื่อผู้สมัคร</h3>
                            <input
                                type="text"
                                placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
                                className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-blue-100">
                                        <th className="p-4 text-blue-800 font-semibold">ชื่อ-สกุล</th>
                                        <th className="p-4 text-blue-800 font-semibold">อีเมล</th>
                                        <th className="p-4 text-blue-800 font-semibold">ระดับชั้น</th>
                                        <th className="p-4 text-blue-800 font-semibold">หลักสูตร</th>
                                        <th className="p-4 text-blue-800 font-semibold">การดำเนินการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app, idx) => (
                                        <tr key={idx} className="border-t hover:bg-blue-50 transition-colors duration-200">
                                            <td className="p-4">{app.fullName}</td>
                                            <td className="p-4">{app.email}</td>
                                            <td className="p-4">{app.gradeLevel}</td>
                                            <td className="p-4">
                                                {app.program === 'science' ? 'สายวิทยาศาสตร์' :
                                                 app.program === 'arts' ? 'สายศิลปะ' :
                                                 app.program === 'sports' ? 'สายกีฬา' :
                                                 app.program === 'tech' ? 'สายเทคโนโลยี' :
                                                 app.program === 'leadership' ? 'โปรแกรมพัฒนาผู้นำ' : '-'}
                                            </td>
                                            <td className="p-4">
                                                <Link href={`/applications/${idx}`} className="text-blue-500 hover:text-blue-700">
                                                    ดูรายละเอียด
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {applications.length === 0 && (
                            <p className="text-center text-gray-500 mt-4">ยังไม่มีผู้สมัคร</p>
                        )}
                    </div>
                </section>
            </main>

            <footer className="bg-blue-100 py-6">
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4].map((_, idx) => (
                        <span key={idx} className="w-4 h-4 bg-blue-400 rounded-full inline-block" />
                    ))}
                </div>
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-blue-800">
                    <span>เกี่ยวกับโรงเรียนของเรา</span>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="relative text-blue-800 font-medium group mt-2 sm:mt-0"
                    >
                        <span className="relative inline-block px-1">
                            กลับไปด้านบน ↑
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 group-hover:w-full transition-all duration-300" />
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
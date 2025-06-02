'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [applicationCount, setApplicationCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [applications, setApplications] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdownRef = useRef(null);

    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('jwt_access');
            const role = localStorage.getItem('user_role');
            if (token) {
                setIsLoggedIn(true);
                const adminStatus = role === 'admin';
                setIsAdmin(adminStatus);
                if (!adminStatus) {
                    router.push('/');
                } else if (searchParams.get('justLoggedIn') === 'true') {
                    router.replace('/dashboard');
                }
            } else {
                localStorage.removeItem('jwt_access');
                localStorage.removeItem('user_role');
                setIsLoggedIn(false);
                router.push('/login');
            }
        };
        const delayCheck = setTimeout(() => {
            checkAuth();
        }, 100);
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

    const handleDelete = (index) => {
        if (confirm('คุณแน่ใจว่าต้องการลบข้อมูลผู้สมัครคนนี้?')) {
            const newApps = [...applications];
            newApps.splice(index, 1);
            setApplications(newApps);
            localStorage.setItem('applications', JSON.stringify(newApps));
        }
    };

    if (!isAdmin) return null;

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
                                            <td className="p-4 space-x-2">
                                                <button
                                                    onClick={() => alert(`ดูรายละเอียดของ ${app.fullName}`)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    ดูรายละเอียด
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(idx)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    ลบ
                                                </button>
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

            <footer className="relative w-full h-[200px] bg-gradient-to-r from-indigo-900 via-blue-800 to-cyan-700 text-white mt-auto overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_80%)]">
                    <Particles
                        id="tsparticles"
                        init={particlesInit}
                        options={{
                            background: {
                                color: {
                                    value: 'transparent',
                                },
                            },
                            fullScreen: { enable: false },
                            fpsLimit: 120,
                            particles: {
                                number: {
                                    value: 60,
                                    density: {
                                        enable: true,
                                        value_area: 800,
                                    },
                                },
                                color: {
                                    value: ['#00f4ff', '#ff5aff', '#ffffff'],
                                    animation: {
                                        enable: true,
                                        speed: 2,
                                        sync: false,
                                    },
                                },
                                shape: {
                                    type: 'circle',
                                },
                                opacity: {
                                    value: { min: 0.3, max: 0.8 },
                                    animation: {
                                        enable: true,
                                        speed: 1.5,
                                        minimumValue: 0.3,
                                        sync: false,
                                    },
                                },
                                size: {
                                    value: { min: 1, max: 5 },
                                    animation: {
                                        enable: true,
                                        speed: 3,
                                        minimumValue: 1,
                                        sync: false,
                                    },
                                },
                                links: {
                                    enable: true,
                                    distance: 150,
                                    color: {
                                        value: '#00f4ff',
                                    },
                                    opacity: 0.4,
                                    width: 1,
                                },
                                move: {
                                    enable: true,
                                    speed: { min: 0.5, max: 2 },
                                    direction: 'none',
                                    outModes: {
                                        default: 'bounce',
                                    },
                                    attract: {
                                        enable: true,
                                        rotateX: 800,
                                        rotateY: 800,
                                    },
                                },
                            },
                            interactivity: {
                                events: {
                                    onHover: {
                                        enable: true,
                                        mode: 'grab',
                                    },
                                    onClick: {
                                        enable: true,
                                        mode: 'bubble',
                                    },
                                },
                                modes: {
                                    grab: {
                                        distance: 200,
                                        links: {
                                            opacity: 0.6,
                                        },
                                    },
                                    bubble: {
                                        distance: 300,
                                        size: 8,
                                        opacity: 0.7,
                                        duration: 1.5,
                                    },
                                },
                            },
                            detectRetina: true,
                        }}
                    />
                </div>
                <div className="relative z-10 container mx-auto px-6 py-10 text-center flex flex-col items-center gap-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider animate-holographic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300">
                        โรงเรียนแห่งอนาคต 🌌
                    </h2>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-200 font-semibold rounded-full shadow-[0_0_10px_rgba(0,255,255,0.6)] hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_20px_rgba(0,255,255,0.9)] hover:scale-105 transition-all duration-500 animate-pulse-slow"
                    >
                        ↑ สู่จุดเริ่มต้น
                    </button>
                </div>
            </footer>
        </div>
    );
}
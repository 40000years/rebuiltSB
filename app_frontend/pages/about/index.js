'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

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
    const [applicationCount, setApplicationCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef(null);
    const bgImages = ['/images/school-bg1.jpg', '/images/school-bg2.jpg', '/images/school-bg3.jpg'];

    // Define particlesInit using useCallback
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

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
            const stored = JSON.parse(localStorage.getItem('applications') || '[]');
            const total = stored.length;
            setApplicationCount(total);
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
        setIsLoggedIn(false);
        router.push('/');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [bgImages.length]);

    return (
        <div className="relative flex flex-col min-h-screen">
            <div className="absolute inset-0 z-[-1]">
                {bgImages.map((src, idx) => (
                    <Image
                        key={idx}
                        src={src}
                        alt={`Background ${idx}`}
                        fill
                        className={`object-cover transition-opacity duration-1000 ease-in-out ${idx === bgIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
            </div>

            <header className="fixed top-0 w-full bg-white shadow-md z-50">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2 relative group">
                        <Image src="/images/school-logo.png" width={65} height={40} alt="School Logo" />
                    </Link>
                    <nav className="flex gap-6">
                        {['Home', 'About Us', 'Programs'].map((text, idx) => {
                            const href = text === 'Home' ? '/' : text === 'About Us' ? '/about' : '/programs';
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
                                        <Image src="/icons/user.png" alt="Profile" width={40} height={40} />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                                            <Link
                                                href="/myprofile"
                                                className="block px-4 py-2 text-blue-700 hover:bg-blue-100"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-blue-700 hover:bg-blue-100"
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
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-28">
                <section className="container mx-auto px-6 py-16 bg-white/80 rounded-xl shadow-lg">
                    <h2 className="text-5xl font-extrabold text-blue-800 text-center mb-10">About Our School</h2>
                    <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
                        <strong className="text-red-500">Bright Future High School</strong> is dedicated to nurturing young minds with a holistic education that blends academic excellence, creativity, and leadership. Our vibrant community fosters a supportive environment where every student thrives.
                    </p>
                    <div className="mt-16 flex justify-center flex-wrap gap-10">
                        {[
                            { letter: 'E', title: 'Excellence', desc: 'Striving for academic and personal growth' },
                            { letter: 'C', title: 'Community', desc: 'Building a supportive and inclusive environment' },
                            { letter: 'I', title: 'Innovation', desc: 'Embracing creativity and forward-thinking' },
                            { letter: 'L', title: 'Leadership', desc: 'Empowering students to lead with confidence' }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group cursor-pointer">
                                <div className="w-36 h-36 bg-gradient-to-br from-blue-300 to-red-500 rounded-full flex items-center justify-center text-5xl font-extrabold text-white shadow-2xl border-4 border-white transition-transform duration-300 group-hover:scale-105">
                                    {item.letter}
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-60 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 z-20">
                                    <div className="relative bg-white rounded-xl shadow-xl px-4 py-3 text-center text-gray-800">
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm"></div>
                                        <h4 className="font-bold text-blue-600">{item.title}</h4>
                                        <p className="text-sm mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-blue-50/80 py-16 mt-12">
                    <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
                        <div>
                            <h3 className="text-4xl font-bold text-blue-800 mb-4">Our Mission</h3>
                            <ul className="list-disc list-inside space-y-3 text-gray-700 text-lg">
                                <li>Empower students with knowledge and skills for a global future</li>
                                <li>Foster a community that values diversity and inclusion</li>
                                <li>Promote innovative teaching to inspire lifelong learning</li>
                                <li>Cultivate leadership and responsibility in every student</li>
                            </ul>
                        </div>
                        <div className="w-full h-72 relative rounded-xl overflow-hidden shadow-xl">
                            <Image src="/images/mission-school.jpg" alt="Our Mission" fill className="object-cover" />
                        </div>
                    </div>
                </section>

                <section className="bg-white/90 py-12 mt-12">
                    <div className="container mx-auto px-6 text-center">
                        <h3 className="text-3xl font-bold text-blue-800 mb-6">What Our Community Says</h3>
                        <p className="text-gray-700 max-w-xl mx-auto italic">
                            “Bright Future High School gave my child the confidence to excel academically and socially.”
                        </p>
                        <p className="text-sm text-gray-500 mt-2">— Parent from our community</p>
                    </div>
                </section>

                <section className="container mx-auto px-6 py-16 bg-blue-50/80 mt-12 rounded-xl shadow-md">
                    <h3 className="text-4xl font-extrabold text-blue-800 text-center mb-8">Our Team</h3>
                    <div className="flex flex-wrap justify-center gap-8">
                        {[
                            { name: 'Dr. Somchai Sukjai', id: 'T001', role: 'Principal', image: '/images/principal.jpg' },
                            { name: 'Ms. Naree Boonmee', id: 'T002', role: 'Head of Academics', image: '/images/teacher1.jpg' },
                            { name: 'Mr. Anan Kitti', id: 'T003', role: 'Student Affairs Coordinator', image: '/images/teacher2.jpg' }
                        ].map((member, idx) => (
                            <div
                                key={idx}
                                className="w-72 bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition"
                            >
                                <div className="w-24 h-24 mx-auto mb-4 relative rounded-full overflow-hidden border-4 border-blue-400">
                                    <Image src={member.image} alt={member.name} fill className="object-cover" />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-800">{member.name}</h4>
                                <p className="text-sm text-gray-500 mb-1">ID: {member.id}</p>
                                <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="relative w-full h-[180px] bg-gradient-to-r from-blue-950 via-indigo-900 to-cyan-800 text-white mt-auto overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.2),transparent_70%)]">
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
                                    value: 50,
                                    density: {
                                        enable: true,
                                        value_area: 700,
                                    },
                                },
                                color: {
                                    value: ['#00e7ff', '#ff4bff', '#ffffff'],
                                    animation: {
                                        enable: true,
                                        speed: 2.5,
                                        sync: false,
                                    },
                                },
                                shape: {
                                    type: 'circle',
                                },
                                opacity: {
                                    value: { min: 0.2, max: 0.7 },
                                    animation: {
                                        enable: true,
                                        speed: 1,
                                        minimumValue: 0.2,
                                        sync: false,
                                    },
                                },
                                size: {
                                    value: { min: 1, max: 4 },
                                    animation: {
                                        enable: true,
                                        speed: 2,
                                        minimumValue: 1,
                                        sync: false,
                                    },
                                },
                                links: {
                                    enable: true,
                                    distance: 120,
                                    color: {
                                        value: '#00e7ff',
                                    },
                                    opacity: 0.5,
                                    width: 0.8,
                                },
                                move: {
                                    enable: true,
                                    speed: { min: 0.3, max: 1.5 },
                                    direction: 'none',
                                    outModes: {
                                        default: 'bounce',
                                    },
                                    attract: {
                                        enable: true,
                                        rotateX: 600,
                                        rotateY: 600,
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
                                        distance: 150,
                                        links: {
                                            opacity: 0.7,
                                        },
                                    },
                                    bubble: {
                                        distance: 200,
                                        size: 6,
                                        opacity: 0.8,
                                        duration: 1,
                                    },
                                },
                            },
                            detectRetina: true,
                        }}
                    />
                </div>
                <div className="relative z-10 container mx-auto px-4 py-8 text-center flex flex-col items-center gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-wide animate-holographic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-400">
                        โรงเรียนแห่งอนาคต 🌌
                    </h2>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="px-6 py-2 bg-transparent border-2 border-cyan-400 text-cyan-200 font-semibold rounded-full shadow-[0_0_8px_rgba(0,255,255,0.7)] hover:bg-cyan-600 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,255,0.9)] hover:scale-105 transition-all duration-400 animate-pulse-slow"
                    >
                        ↑ สู่จุดเริ่มต้น
                    </button>
                </div>
            </footer>
        </div>
    );
}
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export default function ProgramsPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [applicationCount, setApplicationCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();
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

    const programs = [
        {
            title: 'Science Track',
            description: 'Explore cutting-edge science with hands-on experiments and research projects.',
            image: '/images/science-program.jpg',
            href: '/programs/science',
        },
        {
            title: 'Arts Track',
            description: 'Unleash your creativity through visual arts, music, and theater programs.',
            image: '/images/arts-program.jpg',
            href: '/programs/arts',
        },
        {
            title: 'Sports Track',
            description: 'Develop athletic skills and teamwork through competitive sports and fitness.',
            image: '/images/sports-program.jpg',
            href: '/programs/sports',
        },
        {
            title: 'Tech Track',
            description: 'Dive into coding, robotics, and technology innovation with expert guidance.',
            image: '/images/tech-program.jpg',
            href: '/programs/tech',
        },
        {
            title: 'Leadership Program',
            description: 'Build confidence and leadership skills through real-world projects and mentorship.',
            image: '/images/leadership-program.jpg',
            href: '/programs/leadership',
        },
    ];

    return (
        <div className="flex flex-col min-h-screen">
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

            <main className="pt-20">
                <section className="container mx-auto px-6 py-16 bg-white/90 rounded-xl shadow-lg">
                    <h2 className="text-5xl font-extrabold text-blue-800 text-center mb-10">Our Programs</h2>
                    <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
                        Discover the diverse range of academic and extracurricular programs at <strong className="text-red-500">Bright Future High School</strong>. Each program is designed to inspire, challenge, and prepare students for a successful future.
                    </p>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((program, idx) => (
                            <div
                                key={idx}
                                className="relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition duration-300"
                            >
                                <div className="relative h-48">
                                    <Image
                                        src={program.image}
                                        alt={program.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-blue-800 bg-opacity-60 text-white text-xs font-semibold py-1 px-2 rounded">
                                        Program
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-blue-800 mb-2">{program.title}</h3>
                                    <p className="text-gray-600 mb-4">{program.description}</p>
                                    <Link
                                        href={program.href}
                                        className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full transition-colors duration-200"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-blue-50/80 py-16 mt-12">
                    <div className="container mx-auto px-6 text-center">
                        <h3 className="text-3xl font-bold text-blue-800 mb-6">Ready to Join?</h3>
                        <p className="text-gray-700 max-w-xl mx-auto mb-8">
                            Start your journey with us! Explore our programs and apply today to become part of our vibrant community.
                        </p>
                        <Link
                            href="/apply"
                            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-full transition-colors duration-200"
                        >
                            Apply Now
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="bg-blue-100 py-6 mt-12">
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4].map((_, idx) => (
                        <span key={idx} className="w-4 h-4 bg-blue-400 rounded-full inline-block" />
                    ))}
                </div>
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-blue-800">
                    <span>About Our School</span>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="relative text-blue-800 font-medium group mt-2 sm:mt-0"
                    >
                        <span className="relative inline-block px-1">
                            Back to top ↑
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 group-hover:w-full transition-all duration-300" />
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
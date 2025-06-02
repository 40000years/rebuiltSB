'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
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

export default function ApplyPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [applicationCount, setApplicationCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        gradeLevel: '',
        program: '',
        message: ''
    });
    const [formStatus, setFormStatus] = useState(null);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push(formData);
        localStorage.setItem('applications', JSON.stringify(applications));
        setFormStatus('success');
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            gradeLevel: '',
            program: '',
            message: ''
        });
        setTimeout(() => setFormStatus(null), 3000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
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

            <main className="pt-24 pb-16">
                <section className="container mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/apply-banner.jpg"
                                alt="Apply Now"
                                fill
                                className="object-cover transform transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                                <h2 className="text-4xl font-extrabold text-white">Join Bright Future High School</h2>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h3 className="text-3xl font-bold text-blue-800 mb-6">Apply Now</h3>
                            <p className="text-gray-600 mb-8">
                                Take the first step toward an exciting educational journey. Fill out the form below to apply to <strong className="text-red-500">Bright Future High School</strong>.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-blue-800">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-blue-800">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-blue-800">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gradeLevel" className="block text-sm font-medium text-blue-800">
                                        Grade Level
                                    </label>
                                    <select
                                        id="gradeLevel"
                                        name="gradeLevel"
                                        value={formData.gradeLevel}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    >
                                        <option value="" disabled>Select grade level</option>
                                        <option value="9">Grade 9</option>
                                        <option value="10">Grade 10</option>
                                        <option value="11">Grade 11</option>
                                        <option value="12">Grade 12</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="program" className="block text-sm font-medium text-blue-800">
                                        Program of Interest
                                    </label>
                                    <select
                                        id="program"
                                        name="program"
                                        value={formData.program}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    >
                                        <option value="" disabled>Select program</option>
                                        <option value="science">Science Track</option>
                                        <option value="arts">Arts Track</option>
                                        <option value="sports">Sports Track</option>
                                        <option value="tech">Tech Track</option>
                                        <option value="leadership">Leadership Program</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-blue-800">
                                        Additional Information
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="mt-1 w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Tell us about yourself or any questions you have"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-full transition-colors duration-200"
                                >
                                    Submit Application
                                </button>
                            </form>
                            {formStatus === 'success' && (
                                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
                                    Application submitted successfully! We'll contact you soon.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-blue-50/80 py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h3 className="text-3xl font-bold text-blue-800 mb-6">Why Apply?</h3>
                        <p className="text-gray-700 max-w-xl mx-auto mb-8">
                            At <strong className="text-red-500">Bright Future High School</strong>, you'll join a vibrant community dedicated to your growth. Our programs empower you to excel academically and personally.
                        </p>
                        <Link
                            href="/programs"
                            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-full transition-colors duration-200"
                        >
                            Explore Programs
                        </Link>
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
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

export default function HomePage() {
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
    { label: 'Science Track', icon: '/icons/science.png', href: '/programs?science' },
    { label: 'Arts Track', icon: '/icons/arts.png', href: '/programs?arts' },
    { label: 'Sports Track', icon: '/icons/sports.png', href: '/programs?sports' },
    { label: 'Tech Track', icon: '/icons/tech.png', href: '/programs?tech' },
    { label: 'Leadership', icon: '/icons/leadership.png', href: '/programs?leadership' },
  ];

  const highlights = [
    { title: 'Campus Tour', img: '/images/campus.jpg' },
    { title: 'Student Life', img: '/images/student-life.jpg' },
    { title: 'Extracurriculars', img: '/images/activities.jpg' },
  ];

  return (
    <div className="flex flex-col">
      <header className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 relative group">
            <Image src="/images/school-logo.png" width={70} height={40} alt="School Logo" />
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

      <div className="h-20" />

      <section className="relative h-[600px] w-full">
        <Image src="/images/school-banner.jpg" alt="School Banner" fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Join Our Vibrant High School Community</h1>
            <Link
              href="/apply"
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-full transition-colors duration-200"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mt-10">
        <h3 className="text-2xl font-bold mb-6 text-blue-800">Why Choose Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((highlight, idx) => (
            <div
              key={idx}
              className="
                relative w-full h-80 rounded-lg overflow-hidden
                shadow-md hover:shadow-lg
                transform transition-transform duration-300 ease-in-out
                hover:scale-105 hover:-translate-y-2
                "
            >
              <Image
                src={highlight.img}
                alt={highlight.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 bg-blue-800 bg-opacity-60 text-white text-xs font-semibold py-1 px-2 rounded">
                Highlight
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-800 bg-opacity-60 text-white text-sm font-bold py-1 px-3 rounded">
                {highlight.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mt-12">
        <h3 className="text-2xl font-bold mb-6 text-blue-800">Our Programs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
          {programs.map((program, idx) => (
            <Link
              key={idx}
              href={program.href}
              className="flex flex-col items-center hover:text-red-500 transform hover:scale-105 transition-transform duration-200"
            >
              <div className="w-16 h-16 relative">
                <Image src={program.icon} alt={program.label} fill className="object-contain" />
              </div>
              <span className="mt-2 text-center">{program.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mt-12 mb-12">
        <h3 className="text-2xl font-bold mb-6 text-blue-800">Student Testimonials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: 'Student A', comment: 'This school has amazing teachers and a supportive community!' },
            { name: 'Student B', comment: 'The science program prepared me for my dream career.' },
            { name: 'Student C', comment: 'I love the extracurricular activities and clubs!' },
          ].map((testimonial, idx) => (
            <div key={idx} className="border rounded-lg p-4 shadow border-blue-200">
              <div className="font-bold mb-2 text-blue-800">{testimonial.name}</div>
              <p className="text-gray-600">{testimonial.comment}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-blue-100 py-6">
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
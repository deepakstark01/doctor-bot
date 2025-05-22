import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-blue-600">MedBlock</span>
                        </Link>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                            Home
                        </Link>
                        <Link href="/appointments" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname.includes('/appointments') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                            Appointments
                        </Link>
                        <Link href="/doctors" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname.includes('/doctors') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                            Doctors
                        </Link>
                        <Link href="/about" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/about' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                            About
                        </Link>
                        <button className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                            Sign In
                        </button>
                    </div>
                    
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100 focus:outline-none"
                            aria-expanded="false"
                        >
                            <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                        Home
                    </Link>
                    <Link href="/appointments" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname.includes('/appointments') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                        Appointments
                    </Link>
                    <Link href="/doctors" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname.includes('/doctors') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                        Doctors
                    </Link>
                    <Link href="/about" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/about' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                        About
                    </Link>
                    <button className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
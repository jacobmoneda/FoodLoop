"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="relative flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md">
      {/* Menu Button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Menu"
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
            <div className="py-1">
              <Link
                href="/"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                href="/search"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={closeMenu}
              >
                Search
              </Link>
              <Link
                href="/map"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={closeMenu}
              >
                Map
              </Link>
              <Link
                href="/user"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={closeMenu}
              >
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Logo/Title */}
      <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600">
        FoodLoop
      </Link>

      {/* User Icon */}
      <div className="flex items-center">
        {user ? (
          <Link href="/user">
            <Image
              src={user.imageUrl || '/default-avatar.svg'}
              alt="User Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          </Link>
        ) : (
          <Link href="/sign-in" className="text-gray-600 dark:text-gray-400">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}
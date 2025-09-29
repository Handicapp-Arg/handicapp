"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logos/logo-icon-brown.png"
                alt="HandicApp"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-[#3C2013] hidden sm:block">
                HandicApp
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#3C2013] hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              Inicio
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#3C2013] hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="ml-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#3C2013] to-[#5A3420] hover:from-[#5A3420] hover:to-[#6B4525] rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#3C2013] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {open && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#3C2013] hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/login"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#3C2013] hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 text-base font-semibold text-white bg-gradient-to-r from-[#3C2013] to-[#5A3420] rounded-lg shadow-lg mt-2"
                onClick={() => setOpen(false)}
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}



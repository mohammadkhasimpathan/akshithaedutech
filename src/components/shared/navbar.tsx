'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Menu, X, Shield, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Find Jobs', href: '/jobs' },
    { label: 'Students', href: '/register/student', icon: GraduationCap },
    { label: 'Employers', href: '/register/employer', icon: Users },
    { label: 'Colleges', href: '/register/college', icon: Briefcase },
    { label: 'Career Resources', href: '/resources' },
    { label: 'Contact Us', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Akshitha Edutech
            </span>
            <span className="block text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 -mt-1 tracking-wider uppercase">
              Job Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/jobs'
                ? pathname === '/jobs'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            const Icon = link.icon;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                )}
              >
                {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action / Admin Gateway */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-500 hover:text-slate-800">
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Button>
          </Link>
          <Link href="/jobs">
            <Button size="sm" className="shadow-sm">
              Explore Openings
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 dark:border-slate-800 dark:bg-slate-950 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Link href="/jobs" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Explore Openings</Button>
              </Link>
              <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

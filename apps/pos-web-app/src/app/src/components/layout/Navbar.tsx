'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, AlertCircle } from 'lucide-react';

const navItems = [
  { href: '/sync/dashboard', label: 'Sync Dashboard', icon: LayoutDashboard },
  { href: '/sync/settings', label: 'Sync Settings', icon: Settings },
  { href: '/sync/errors', label: 'Sync Errors', icon: AlertCircle },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/sync/dashboard" className="text-xl font-bold text-blue-600">
            Ryzera POS
          </Link>
          <div className="flex gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
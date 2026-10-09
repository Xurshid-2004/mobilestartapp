'use client';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">HamJoy</p>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Admin only
            </span>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}

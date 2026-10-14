'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Building2, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/navigation/routes';

const CHOICES = [
  { href: ROUTES.createJob, label: 'Ish eʼloni', description: 'Vakansiya joylash', icon: Briefcase },
  { href: ROUTES.createListing, label: 'Uy-joy eʼloni', description: 'Sotuv yoki ijara', icon: Building2 },
];

/** Sidebar "Eʼlon joylash": one button, the category (Ish / Uy-joy) is picked in its menu. */
export function PostListingButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isActive = pathname === ROUTES.create;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="sidebar-post-menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2',
          isActive || open
            ? 'bg-orange-600 shadow-lg shadow-orange-500/25'
            : 'bg-[var(--color-accent)] hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25'
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Plus className="h-6 w-6" strokeWidth={2.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-bold leading-tight">Eʼlon joylash</span>
          <span className="block text-xs font-medium text-white/80">Ish yoki uy-joy</span>
        </span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          id="sidebar-post-menu"
          className="absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-[var(--color-border)] bg-white p-1.5 shadow-xl"
        >
          {CHOICES.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-orange-50 focus-visible:bg-orange-50 focus-visible:outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-[var(--color-accent)]">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--color-secondary)]">{label}</span>
                <span className="block text-xs text-[var(--color-muted)]">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

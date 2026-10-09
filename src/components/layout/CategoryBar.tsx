'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/navigation/routes';
import { MEGA_MENUS, type MegaMenu } from '@/lib/navigation/mega-menu';

const OPEN_DELAY_MS = 90;
const CLOSE_DELAY_MS = 160;

function MegaPanel({ menu, onNavigate }: { menu: MegaMenu; onNavigate: () => void }) {
  return (
    <div className="px-7 pb-5 pt-6">
      <div
        className="grid gap-x-10 gap-y-6"
        style={{ gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0, auto))` }}
      >
        {menu.columns.map((column, ci) => (
          <div key={ci} className="flex flex-col gap-6">
            {column.map((group) => (
              <div key={`${ci}-${group.title}`} className="min-w-0">
                {group.href ? (
                  <Link
                    href={group.href}
                    onClick={onNavigate}
                    className="mb-2 block text-[15px] font-bold text-[var(--color-secondary)] hover:text-[var(--color-brand-green)]"
                  >
                    {group.title}
                  </Link>
                ) : (
                  <p className="mb-2 text-[15px] font-bold text-[var(--color-secondary)]">
                    {group.title}
                  </p>
                )}
                <ul className="flex flex-col">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className="-mx-2 block truncate rounded-lg px-2 py-1.5 text-[15px] text-gray-600 transition-colors hover:bg-[var(--color-brand-green)]/[0.06] hover:text-[var(--color-brand-green)] focus-visible:bg-[var(--color-brand-green)]/[0.06] focus-visible:text-[var(--color-brand-green)] focus-visible:outline-none"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end border-t border-[var(--color-border)] pt-4">
        <Link
          href={menu.href}
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-green)] hover:underline"
        >
          Barcha “{menu.label}” eʼlonlari
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/** Desktop category bar with click/hover mega-menus, under the platform navbar. */
export function CategoryBar() {
  const [openId, setOpenId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const scheduleOpen = (id: string) => {
    clearTimer();
    timer.current = setTimeout(() => setOpenId(id), openId ? 0 : OPEN_DELAY_MS);
  };

  const scheduleClose = () => {
    clearTimer();
    timer.current = setTimeout(() => setOpenId(null), CLOSE_DELAY_MS);
  };

  const close = () => {
    clearTimer();
    setOpenId(null);
  };

  useEffect(() => () => clearTimer(), []);

  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (e: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenId(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenId(null);
      tabRefs.current[openId]?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openId]);

  const openMenu = MEGA_MENUS.find((m) => m.id === openId);

  return (
    <div
      ref={barRef}
      onMouseLeave={scheduleClose}
      onMouseEnter={clearTimer}
      className="relative mx-auto hidden max-w-7xl items-end px-4 sm:px-6 lg:flex"
    >
      <nav aria-label="Kategoriyalar" className="flex items-end gap-1">
        {MEGA_MENUS.map((menu) => {
          const isOpen = openId === menu.id;
          return (
            <button
              key={menu.id}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`mega-${menu.id}`}
              ref={(el) => {
                tabRefs.current[menu.id] = el;
              }}
              onMouseEnter={() => scheduleOpen(menu.id)}
              onClick={() => {
                clearTimer();
                setOpenId(isOpen ? null : menu.id);
              }}
              className={cn(
                'relative inline-flex h-12 items-center gap-2 rounded-t-xl px-5 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-gold)]/70',
                isOpen
                  ? 'relative z-[60] -mb-px border border-b-0 border-[var(--nav-tab-open-border)] bg-white text-[var(--color-secondary)]'
                  : 'border border-b-0 border-transparent text-[var(--nav-fg-muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]'
              )}
            >
              {menu.label}
              <ChevronDown
                className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
                strokeWidth={2.5}
              />
            </button>
          );
        })}
      </nav>

      <Link
        href={ROUTES.map}
        className="mb-2 ml-auto inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--nav-fg-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]"
      >
        <MapIcon className="h-4 w-4 text-[var(--nav-accent)]" />
        Xaritadan qidirish
      </Link>

      <AnimatePresence>
        {openMenu && (
          <motion.div
            key="mega"
            id={`mega-${openMenu.id}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute left-4 right-4 top-full z-50 max-h-[calc(100dvh-9rem)] overflow-y-auto rounded-b-2xl rounded-tr-2xl border border-[var(--nav-tab-open-border)] bg-white text-[var(--color-secondary)] shadow-[0_24px_60px_-12px_var(--nav-shadow)] sm:left-6 sm:right-6',
              // The first tab sits flush on the panel's left edge; others need a rounded corner.
              openMenu.id !== MEGA_MENUS[0].id && 'rounded-tl-2xl'
            )}
          >
            {/* Re-keyed per menu so switching tabs swaps content without replaying the exit. */}
            <div key={openMenu.id}>
              <MegaPanel menu={openMenu} onNavigate={close} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Same menus as accordions, for the mobile sheet. */
export function MobileCategoryMenu({ onNavigate }: { onNavigate: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="mt-3 border-t border-[var(--nav-border)] pt-3">
      <p className="mb-1 px-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--nav-fg-subtle)]">
        Kategoriyalar
      </p>
      {MEGA_MENUS.map((menu) => {
        const isOpen = expanded === menu.id;
        return (
          <div key={menu.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setExpanded(isOpen ? null : menu.id)}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-sm font-semibold hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]"
            >
              {menu.label}
              <ChevronDown
                className={cn('h-4 w-4 text-[var(--nav-fg-subtle)] transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen && (
              <div className="mb-2 ml-2.5 border-l border-[var(--nav-border)] pl-3">
                {menu.columns.flat().map((group, gi) => (
                  <div key={`${group.title}-${gi}`} className="py-1.5">
                    {group.title.trim() && (
                      <p className="mb-0.5 text-xs font-bold text-[var(--nav-accent)]">
                        {group.title}
                      </p>
                    )}
                    {group.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onNavigate}
                        className="block rounded-lg px-2 py-1.5 text-sm text-[var(--nav-fg-muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link
                  href={menu.href}
                  onClick={onNavigate}
                  className="mt-1 inline-flex items-center gap-1 px-2 py-1.5 text-sm font-semibold text-[var(--nav-accent)]"
                >
                  Barchasi <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

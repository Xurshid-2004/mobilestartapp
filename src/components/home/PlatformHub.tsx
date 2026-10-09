'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { PLATFORM_SECTIONS, type PlatformSection } from '@/lib/navigation/platform';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useJobs } from '@/hooks/useJobs';
import { Carousel, type Slide } from '@/components/ui/Carousel';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import type { JobListItem } from '@/types';

const HERO_SLIDE_COUNT = 5;

/** Company "cover" for a slide — jobs have no photos, and logos are too small to upscale. */
function companyCover(company: string): string {
  const params = new URLSearchParams({
    name: company,
    size: '512',
    background: 'F3DE9C',
    color: '1F6B3F',
    bold: 'true',
    'font-size': '0.36',
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/** Featured jobs first, then the best-paid ones, as hero slides. */
function toHeroSlides(jobs: JobListItem[]): Slide[] {
  return [...jobs]
    .sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.salaryMax - a.salaryMax
    )
    .slice(0, HERO_SLIDE_COUNT)
    .map((job) => ({
      id: job.id,
      title: job.title,
      subtitle: job.region ? `${job.company} · ${job.region}` : job.company,
      price: job.salaryMax > 0 ? job.salaryMax : undefined,
      image: companyCover(job.company),
    }));
}

function HeroCarousel() {
  const router = useRouter();
  const { data: jobs, isLoading } = useJobs();
  const slides = useMemo(() => toHeroSlides(jobs), [jobs]);

  if (isLoading) {
    // Same footprint as the carousel so the page doesn't jump when it loads.
    return (
      <div
        aria-hidden
        className="mb-8 h-48 animate-pulse rounded-3xl bg-gradient-to-r from-slate-200 via-teal-100 to-emerald-100 sm:h-64"
      />
    );
  }

  return (
    <Carousel
      slides={slides}
      currency="$ gacha"
      onSlideClick={(id) => router.push(ROUTES.job(String(id)))}
    />
  );
}

function SectionCard({ section }: { section: PlatformSection }) {
  const Icon = section.icon;
  const isReady = Boolean(section.href);

  return (
    <article id={section.id} className="card flex flex-col p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
            section.tone
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--color-secondary)]">{section.title}</h2>
            {!isReady && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-muted)]">
                Tez orada
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">{section.description}</p>
        </div>
      </div>

      <ul className="mb-5 flex flex-1 flex-col gap-1.5">
        {section.links.map((link) => {
          const LinkIcon = link.icon;
          const row = (
            <>
              <LinkIcon className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[var(--color-secondary)]">
                  {link.label}
                </span>
                <span className="block truncate text-xs text-[var(--color-muted)]">
                  {link.description}
                </span>
              </span>
              {link.href ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
              ) : (
                <span className="shrink-0 text-[10px] font-semibold text-[var(--color-muted)]">
                  Tez orada
                </span>
              )}
            </>
          );

          return (
            <li key={link.label}>
              {link.href ? (
                <Link
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2.5 transition-colors hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary-light)]/50"
                >
                  {row}
                </Link>
              ) : (
                <div
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] px-3 py-2.5 opacity-70"
                >
                  {row}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {isReady ? (
        <Link
          href={section.href as string}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-secondary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          {section.title} boʻlimiga oʻtish
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-[var(--color-muted)]">
          Tez orada ochiladi
        </span>
      )}
    </article>
  );
}

/** The platform hub: every section branches out from here. */
export function PlatformHub() {
  const user = useCurrentUser();
  const firstName = user.name.split(' ')[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <HeroCarousel />

      <section className="mb-8 sm:mb-10">
        <p className="mb-2 text-sm text-[var(--color-muted)]">
          Assalomu alaykum{firstName ? `, ${firstName}` : ''} 👋
        </p>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-[var(--color-secondary)] sm:text-4xl">
          Uy-joy va ish — bitta platformada
        </h1>
        <p className="mt-3 max-w-xl text-[var(--color-muted)]">
          Kerakli boʻlimni tanlang: uy-joy ijarasi va savdosi, ish qidirish yoki oʻz eʼloningizni
          joylash.
        </p>
      </section>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
        {PLATFORM_SECTIONS.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

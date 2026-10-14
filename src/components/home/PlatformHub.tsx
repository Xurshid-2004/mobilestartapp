'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, TrendingUp, MapPin, ChevronRight } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useJobs, useFeaturedJobs, useRecentJobs } from '@/hooks/useJobs';
import { useCategories } from '@/hooks/useCategories';
import { Carousel, type Slide } from '@/components/ui/Carousel';
import { ListingsSection } from '@/components/listings/ListingsSection';
import { JobCard } from '@/components/jobs/JobCard';
import { SearchBar } from '@/components/jobs/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import type { Category, JobListItem } from '@/types';

const HERO_SLIDE_COUNT = 5;

/** Hand-picked banners shown before the job slides; each opens its own page. */
const PROMO_SLIDES: (Slide & { href: string })[] = [
  {
    id: 'promo-uy-joy',
    title: 'Orzuingizdagi uyni toping',
    subtitle: 'Hovli va kvartiralar — sotuv va ijara',
    image: '/carousel/uy-joy-hovli.webp',
    cover: true,
    href: '/uy-joy/sotuv',
  },
  {
    id: 'promo-ish',
    title: 'Oʻzingizga mos ishni toping',
    subtitle: 'Qurilish va boshqa sohalardagi vakansiyalar',
    image: '/carousel/ish-quruvchi.webp',
    cover: true,
    coverPosition: 'object-right',
    href: ROUTES.jobs,
  },
];

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
  const slides = useMemo(() => [...PROMO_SLIDES, ...toHeroSlides(jobs)], [jobs]);

  if (isLoading) {
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
      onSlideClick={(id) => {
        const promo = PROMO_SLIDES.find((s) => s.id === id);
        router.push(promo ? promo.href : ROUTES.job(String(id)));
      }}
    />
  );
}

/** Category chip filter — horizontal scrollable list */
function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0',
          selected === null
            ? 'bg-[var(--color-primary)] text-white shadow-sm'
            : 'bg-white text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
        )}
      >
        Barchasi
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id === selected ? null : cat.id)}
          className={cn(
            'whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0',
            selected === cat.id
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'bg-white text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

/** Ish e'lonlari bo'limi — featured + tanlangan kategoriya bo'yicha filtrlash */
function JobsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoriesResult = useCategories();
  const featured = useFeaturedJobs(2);
  const recent = useRecentJobs(8);

  const categories = categoriesResult.data;

  // Filter jobs by selected category
  const filteredJobs = useMemo(() => {
    if (!selectedCategory) return recent.data;
    return recent.data.filter((job) => job.categoryId === selectedCategory);
  }, [recent.data, selectedCategory]);

  const isLoading = featured.isLoading || recent.isLoading || categoriesResult.isLoading;
  const error = featured.error ?? recent.error ?? categoriesResult.error;

  const refreshAll = useCallback(async () => {
    await Promise.all([featured.refetch(), recent.refetch(), categoriesResult.refetch()]);
  }, [featured, recent, categoriesResult]);

  return (
    <section className="mt-6 sm:mt-8">
      {/* Search bar — links to full search page */}
      <div className="mb-5">
        <SearchBar asLink placeholder="Ish, kompaniya yoki koʻnikma qidiring..." />
      </div>

      {/* Map link */}
      <Link
        href="/map"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3.5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-primary)]/30"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
          <MapPin className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[var(--color-secondary)]">
            Yaqinimdagi ishlar
          </span>
          <span className="block truncate text-xs text-[var(--color-muted)]">
            Xaritadan eng yaqin ishlarni toping
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
      </Link>

      {/* Trending banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 rounded-full px-2.5 py-1 mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Hozir trenddagi
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-1">Bu hafta 1 200+ yangi ish</h2>
          <p className="text-blue-100 text-sm mb-4 max-w-xs">
            Dizayn, IT, marketing va boshqa sohalardagi eng yaxshi imkoniyatlar.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center text-sm font-semibold bg-white text-[var(--color-primary)] px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Barchasi ishlarni koʻrish
          </Link>
        </div>
      </div>

      <QueryErrorBanner message={error} onRetry={refreshAll} />

      {isLoading ? (
        <JobListSkeleton count={4} />
      ) : (
        <>
          {/* Featured jobs */}
          {featured.data.length > 0 && (
            <section className="mb-8">
              <SectionHeader title="Tavsiya etilgan" href="/search" />
              <div className="flex flex-col gap-3 sm:gap-4">
                {featured.data.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} featured />
                ))}
              </div>
            </section>
          )}

          {/* Category chips */}
          <section className="mb-6">
            <SectionHeader title="Kategoriyalar" />
            <CategoryChips
              categories={categories.slice(0, 15)}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </section>

          {/* Filtered job list */}
          <section className="mb-8">
            <SectionHeader
              title={selectedCategory ? 'Tanlangan kategoriya' : 'Soʻnggi ishlar'}
              href="/search"
              linkLabel="Barchasi"
            />
            {filteredJobs.length > 0 ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                {filteredJobs.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center">
                <Search className="mx-auto mb-3 h-10 w-10 text-[var(--color-muted)]" />
                <p className="text-sm font-semibold text-[var(--color-secondary)]">
                  Bu kategoriyada hozircha ish topilmadi
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Boshqa kategoriyani tanlang yoki barcha ishlarni koʻring
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Barchasi ishlar <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

/** The platform hub: every section branches out from here. */
export function PlatformHub() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <HeroCarousel />

      <JobsSection />

      <ListingsSection />
    </div>
  );
}

'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { Bell, TrendingUp, MapPin, ChevronRight, Bookmark, FileText, Users } from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';
import { SearchBar } from '@/components/jobs/SearchBar';
import { CategoryCard } from '@/components/jobs/CategoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PageHeader } from '@/components/ui/PageHeader';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { useFeaturedJobs, useRecentJobs } from '@/hooks/useJobs';
import { useCategories } from '@/hooks/useCategories';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNotifications } from '@/context/NotificationsContext';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

export function HomeContent() {
  useScrollRestore();
  const user = useCurrentUser();
  const { unreadCount } = useNotifications();
  const featured = useFeaturedJobs(2);
  const recent = useRecentJobs(4);
  const categoriesResult = useCategories();

  const refreshAll = useCallback(async () => {
    await Promise.all([featured.refetch(), recent.refetch(), categoriesResult.refetch()]);
  }, [featured, recent, categoriesResult]);

  usePullToRefresh(refreshAll);

  const featuredJobs = featured.data;
  const recentJobs = recent.data;
  const categories = categoriesResult.data;
  const isLoading = featured.isLoading || recent.isLoading || categoriesResult.isLoading;
  const error = featured.error ?? recent.error ?? categoriesResult.error;

  return (
    <div className="page-container">
      <PageHeader
        greeting={`Assalomu alaykum, ${user.name.split(' ')[0]} 👋`}
        title="Orzuingizdagi ishni toping"
        action={
          <div className="flex items-center gap-2">
            <RefreshButton onRefresh={refreshAll} label="Yangilash" />
            <Link
              href="/notifications"
              className="w-11 h-11 rounded-xl card flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-colors relative touch-manipulation active:scale-95"
              aria-label={`Bildirishnomalar${unreadCount > 0 ? `, ${unreadCount} ta oʻqilmagan` : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        }
      />

      <div className="mb-4">
        <SearchBar asLink placeholder="Ish, kompaniya yoki koʻnikma qidiring..." />
      </div>

      <Link
        href="/map"
        className="mb-8 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3.5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-primary)]/30"
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

      <div className="mb-8 grid grid-cols-3 gap-3 md:hidden">
        {[
          { href: '/favorites', icon: Bookmark, label: 'Saqlangan', cls: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' },
          { href: '/applications', icon: FileText, label: 'Arizalarim', cls: 'bg-[var(--color-success-light)] text-[var(--color-success)]' },
          { href: '/applicants', icon: Users, label: 'Nomzodlar', cls: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' },
        ].map(({ href, icon: Icon, label, cls }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-primary)]/30"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${cls}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold text-[var(--color-secondary)]">{label}</span>
          </Link>
        ))}
      </div>

      <QueryErrorBanner message={error} onRetry={refreshAll} />

      {isLoading ? (
        <JobListSkeleton count={3} />
      ) : (
        <>

      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 p-5 sm:p-6 text-white relative overflow-hidden">
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
            Ishlarni koʻrish
          </Link>
        </div>
      </div>

      <section className="mb-8">
        <SectionHeader title="Tavsiya etilgan" href="/search" />
        <div className="flex flex-col gap-3 sm:gap-4">
          {featuredJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} featured />
          ))}
        </div>
      </section>

      <section className="mb-8 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <SectionHeader title="Kategoriyalar" href="/categories" />
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto hide-scrollbar pb-1">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Soʻnggi ishlar" />
        <div className="flex flex-col gap-3 sm:gap-4">
          {recentJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index + featuredJobs.length} />
          ))}
        </div>
      </section>
        </>
      )}
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, Briefcase } from 'lucide-react';
import { PlatformNavbar } from '@/components/layout/PlatformNavbar';
import { createPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/lib/navigation/routes';

const SECTIONS: Record<string, string> = {
  sotuv: 'Sotuv',
  ijara: 'Ijara',
  olish: 'Olish',
  'yangi-uylar': 'Turar joy majmuasi',
};

const FILTER_LABELS: Record<string, string> = {
  tur: 'Turi',
  xona: 'Xonalar',
  sotix: 'Sotix',
  qavat: 'Qavat',
  kategoriya: 'Kategoriya',
  maqsad: 'Maqsad',
  muddat: 'Muddat',
  holat: 'Holati',
  sotuvchi: 'Sotuvchi',
  narx: 'Narx (mln soʻm)',
  topshirish: 'Topshirish',
  maydon: 'Maydon (m²)',
  hudud: 'Hudud',
  planirovka: 'Planirovka',
  tolov: 'Toʻlov',
  tamir: 'Taʼmir',
};

export async function generateMetadata(props: PageProps<'/uy-joy/[bolim]'>) {
  const { bolim } = await props.params;
  return createPageMetadata({
    title: `Uy-joy — ${SECTIONS[bolim] ?? 'Eʼlonlar'}`,
    description: 'Uy-joy ijarasi, sotuvi va yangi turar joy majmualari eʼlonlari.',
    path: `/uy-joy/${bolim}`,
  });
}

/**
 * Placeholder for the real-estate listings. The category menus already link here
 * with their final filter params; the listing UI replaces this page later.
 */
export default async function UyJoySectionPage(props: PageProps<'/uy-joy/[bolim]'>) {
  const { bolim } = await props.params;
  const searchParams = await props.searchParams;
  const title = SECTIONS[bolim];
  if (!title) notFound();

  const filters = Object.entries(searchParams).flatMap(([key, value]) =>
    (Array.isArray(value) ? value : value ? [value] : []).map((v) => ({
      key,
      label: FILTER_LABELS[key] ?? key,
      value: v.replace(/-/g, ' '),
    }))
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <PlatformNavbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
            <Building2 className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-green)]">
            Uy-joy · {title}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--color-secondary)] sm:text-3xl">
            Bu boʻlim tez orada ochiladi
          </h1>
          <p className="mt-3 max-w-md text-sm text-[var(--color-muted)]">
            Uy-joy eʼlonlari ustida ishlayapmiz. Tanlagan filtrlaringiz saqlanadi va boʻlim
            ochilganda shu havola orqali natijalar koʻrinadi.
          </p>

          {filters.length > 0 && (
            <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Tanlangan filtrlar">
              {filters.map((f) => (
                <li
                  key={`${f.key}-${f.value}`}
                  className="rounded-full border border-[var(--color-border)] bg-gray-50 px-3 py-1 text-xs text-[var(--color-secondary)]"
                >
                  <span className="text-[var(--color-muted)]">{f.label}:</span> {f.value}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={ROUTES.home}
              className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-secondary)] hover:bg-gray-50"
            >
              Bosh sahifa
            </Link>
            <Link
              href={ROUTES.jobs}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <Briefcase className="h-4 w-4" />
              Ish boʻlimiga oʻtish
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

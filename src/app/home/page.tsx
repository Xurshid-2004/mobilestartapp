import { PlatformNavbar } from '@/components/layout/PlatformNavbar';
import { PlatformHub } from '@/components/home/PlatformHub';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Bosh sahifa',
  description: "Uy-joy ijarasi va savdosi, ish qidirish va e'lon joylash — barchasi HamJoy'da.",
  path: '/home',
});

/**
 * Asosiy ekran — the platform hub. Every section branches out from here:
 * choosing "Ish" opens the jobs section (/ish), "Uy-joy" the housing section, etc.
 */
export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <PlatformNavbar />
      <PlatformHub />
    </div>
  );
}

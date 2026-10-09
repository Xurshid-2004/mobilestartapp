import { HomeContent } from './HomeContent';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Ishlar',
  description: "Tavsiya etilgan ishlar, kategoriyalar va so'nggi e'lonlarni HamJoy'da ko'ring.",
  path: '/ish',
});

export default function JobsHomePage() {
  return <HomeContent />;
}

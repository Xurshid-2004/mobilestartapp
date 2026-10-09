import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Building2,
  ClipboardList,
  FileUser,
  HandCoins,
  KeyRound,
  MessageCircle,
  PlusCircle,
  Search,
  Tag,
  UserRound,
} from 'lucide-react';
import { ROUTES } from './routes';

/**
 * The platform tree — the hub (/home) and the top navbar both render from this,
 * so adding a section or a sub-page is a one-line change here.
 *
 *   PLATFORM
 *   ├── UY-JOY  → Ijara | Sotuv | Olish
 *   ├── ISH     → Ish qidirish | Joylash (Vakansiya, CV)
 *   └── ACCOUNT → Profil | Eʼlonlarim | Chat
 */

export interface PlatformLink {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Omitted while the page is not built yet — rendered as "Tez orada". */
  href?: string;
}

export interface PlatformSection {
  id: 'uy-joy' | 'ish' | 'account';
  title: string;
  description: string;
  icon: LucideIcon;
  /** Section landing page; omitted while the section is not built yet. */
  href?: string;
  /** Tailwind classes for the section's icon tile. */
  tone: string;
  links: PlatformLink[];
}

export const PLATFORM_SECTIONS: PlatformSection[] = [
  {
    id: 'uy-joy',
    title: 'Uy-joy',
    description: 'Ijaraga olish, sotish va uy-joy sotib olish eʼlonlari',
    icon: Building2,
    tone: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    links: [
      { label: 'Ijara', description: 'Ijaraga beriladigan uy-joylar', icon: KeyRound },
      { label: 'Sotuv', description: 'Sotiladigan kvartira va hovlilar', icon: Tag },
      { label: 'Olish', description: 'Uy-joy sotib olish', icon: HandCoins },
    ],
  },
  {
    id: 'ish',
    title: 'Ish',
    description: 'Ish qidiring yoki vakansiya va CV joylang',
    icon: Briefcase,
    href: ROUTES.jobs,
    tone: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    links: [
      {
        label: 'Ish qidirish',
        description: 'Filtr va xarita bilan vakansiyalar',
        icon: Search,
        href: ROUTES.search,
      },
      {
        label: 'Vakansiya joylash',
        description: 'Xodim topish uchun eʼlon bering',
        icon: PlusCircle,
        href: ROUTES.create,
      },
      { label: 'CV joylash', description: 'Rezyumeingizni eʼlon qiling', icon: FileUser },
    ],
  },
  {
    id: 'account',
    title: 'Hisobim',
    description: 'Profil, eʼlonlaringiz va xabarlar',
    icon: UserRound,
    href: ROUTES.profile,
    tone: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
    links: [
      { label: 'Profil', description: 'Shaxsiy maʼlumotlar', icon: UserRound, href: ROUTES.profile },
      { label: 'Eʼlonlarim', description: 'Joylagan eʼlonlaringiz', icon: ClipboardList, href: '/my-jobs' },
      { label: 'Chat', description: 'Xabarlar va suhbatlar', icon: MessageCircle, href: ROUTES.chat },
    ],
  },
];

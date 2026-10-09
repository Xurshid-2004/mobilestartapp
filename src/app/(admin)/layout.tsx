import { createPageMetadata } from '@/lib/seo/metadata';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = createPageMetadata({
  title: 'Admin',
  description: 'HamJoy administration panel.',
  path: '/admin',
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

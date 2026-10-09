'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreateJobWizard } from '@/components/jobs/create/CreateJobWizard';
import { RequireAuth } from '@/components/auth/RequireAuth';

function CreateJobInner() {
  const searchParams = useSearchParams();
  const editJobId = searchParams.get('edit') ?? undefined;
  return <CreateJobWizard editJobId={editJobId} />;
}

export default function CreateJobPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <CreateJobInner />
      </Suspense>
    </RequireAuth>
  );
}

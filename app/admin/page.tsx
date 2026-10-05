import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminPanel } from './_components/admin-panel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  if (session.user.role !== 'admin') {
    redirect('/');
  }
  return <AdminPanel />;
}

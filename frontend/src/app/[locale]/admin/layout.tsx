import { ReactNode } from 'react';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin Dashboard | Quranic Academy',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
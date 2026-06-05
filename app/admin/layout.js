import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'DevSignal Admin',
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}

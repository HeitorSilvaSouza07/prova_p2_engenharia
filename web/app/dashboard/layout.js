import '../styles/dashboard.css';
import DashboardShell from '@/components/DashboardShell';

export const metadata = {
  title: 'Painel',
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}

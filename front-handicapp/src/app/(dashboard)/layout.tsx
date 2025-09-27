import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout as DashboardLayoutComponent } from '@/components/layout/DashboardLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayoutComponent>
        {children}
      </DashboardLayoutComponent>
    </ProtectedRoute>
  );
}
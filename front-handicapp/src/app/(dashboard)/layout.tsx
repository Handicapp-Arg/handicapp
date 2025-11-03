import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout as DashboardLayoutComponent } from '@/components/layout/DashboardLayout';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { DashboardErrorBoundary } from '@/components/error';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <ProtectedRoute>
        <NotificationProvider>
          <DashboardLayoutComponent>
            {children}
          </DashboardLayoutComponent>
        </NotificationProvider>
      </ProtectedRoute>
    </DashboardErrorBoundary>
  );
}
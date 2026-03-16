import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function getDashboardUrlByRoleId(roleId?: string): string {
  const map: Record<string, string> = {
    '1': '/admin',
    '2': '/establecimiento',
    '6': '/propietario',
  };
  return map[roleId || ''] || '/propietario';
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const roleId = cookieStore.get('role')?.value;

  // Si no está autenticado, enviar a login
  if (!token) {
    redirect('/login');
  }

  // Autenticado: llevar directo a su dashboard por rol (fallback propietario)
  redirect(getDashboardUrlByRoleId(roleId));
}
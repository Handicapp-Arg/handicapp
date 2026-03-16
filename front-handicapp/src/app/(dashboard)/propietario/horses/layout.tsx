import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mis Caballos | Handicapp',
  description: 'Gestiona tus caballos: historial médico, eventos, gastos y estadísticas de rendimiento.',
  keywords: ['gestión de caballos', 'historial médico equino', 'eventos deportivos', 'caballos de competición'],
};

export default function CaballosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

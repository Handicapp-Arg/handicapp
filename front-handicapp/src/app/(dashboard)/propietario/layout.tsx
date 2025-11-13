import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Propietario | Handicapp',
  description: 'Panel de control para propietarios de caballos. Gestiona tus caballos, eventos, gastos y más.',
  keywords: ['gestión de caballos', 'dashboard propietario', 'caballos de competición', 'eventos ecuestres'],
};

export default function PropietarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

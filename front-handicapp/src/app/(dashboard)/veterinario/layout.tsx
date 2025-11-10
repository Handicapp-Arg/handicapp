import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Veterinario | Handicapp',
  description: 'Panel de control para veterinarios. Gestiona tratamientos, pacientes y consultas veterinarias.',
  keywords: ['veterinaria equina', 'tratamientos', 'consultas veterinarias', 'medicina equina'],
};

export default function VeterinarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

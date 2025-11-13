import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Establecimientos | Handicapp',
  description: 'Explora establecimientos hípicos: haras, clubes de polo, escuelas de salto y más. Encuentra el mejor lugar para tu caballo.',
  keywords: ['establecimientos hípicos', 'haras', 'polo', 'salto', 'doma', 'clubes ecuestres'],
};

export default function EstablecimientosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

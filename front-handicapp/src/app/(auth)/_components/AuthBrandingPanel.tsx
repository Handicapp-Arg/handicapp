import { LOGOS } from '@/lib/constants/logos';

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const FEATURES = [
  'Fichas completas de caballos',
  'Eventos veterinarios y deportivos',
  'Gestión de tareas y personal',
];

export function AuthBrandingPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-shrink-0 relative overflow-hidden min-h-screen"
      style={{ backgroundColor: '#0d1420' }}
    >
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '256px' }}
      />

      {/* Ambient glow — gold bottom center */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[340px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center bottom, rgba(175,147,111,0.13) 0%, transparent 65%)' }}
      />

      {/* Ambient glow — subtle top left */}
      <div
        className="absolute top-0 left-0 w-[300px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(175,147,111,0.06) 0%, transparent 60%)' }}
      />

      {/* Large decorative H */}
      <div
        className="absolute right-[-30px] top-1/2 -translate-y-[52%] select-none pointer-events-none leading-none font-bold"
        style={{
          fontSize: 'clamp(280px, 34vw, 440px)',
          fontFamily: 'Georgia, "Times New Roman", serif',
          background: 'linear-gradient(160deg, rgba(175,147,111,0.15) 0%, rgba(175,147,111,0.03) 55%, transparent 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        H
      </div>

      {/* Thin gold bottom rule */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(175,147,111,0.4) 40%, rgba(175,147,111,0.4) 60%, transparent 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between w-full h-full px-10 xl:px-14 pt-7 pb-12">

        <div />

        {/* Main copy + features */}
        <div>
          <p
            className="text-[#af936f] font-bold mb-5"
            style={{ fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase' }}
          >
            Gestión Ecuestre
          </p>
          <h2
            className="text-white font-bold leading-[1.1] mb-8"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            }}
          >
            Para quienes<br />viven el campo.
          </h2>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#af936f', opacity: 0.7 }}
                />
                <span
                  className="text-white/40 font-medium"
                  style={{ fontSize: 12, letterSpacing: '0.02em' }}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p
          className="text-white/15 font-medium"
          style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' }}
        >
          © 2026
        </p>
      </div>
    </div>
  );
}

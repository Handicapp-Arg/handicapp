export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <style>{`
        @keyframes authFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-fade-up {
          animation: authFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .auth-fade-up-1 { animation-delay: 0.05s; }
        .auth-fade-up-2 { animation-delay: 0.12s; }
        .auth-fade-up-3 { animation-delay: 0.19s; }
        .auth-fade-up-4 { animation-delay: 0.26s; }
        .auth-fade-up-5 { animation-delay: 0.33s; }

        /* Floating label */
        .float-wrap { position: relative; }
        .float-wrap .float-input {
          height: 54px;
          padding-top: 20px;
          padding-bottom: 6px;
          padding-left: 16px;
          padding-right: 16px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #1e293b;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .float-wrap .float-input.has-right { padding-right: 44px; }
        .float-wrap .float-input:focus {
          border-color: #af936f;
          box-shadow: 0 0 0 3px rgba(175,147,111,0.15);
        }
        .float-wrap .float-input.input-error { border-color: #fca5a5; background: rgba(254,242,242,0.3); }
        .float-wrap .float-input.input-error:focus { border-color: #f87171; box-shadow: 0 0 0 3px rgba(248,113,113,0.12); }
        .float-wrap .float-input.input-success { border-color: #86efac; }
        .float-wrap .float-input.input-success:focus { box-shadow: 0 0 0 3px rgba(134,239,172,0.15); }
        .float-label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13.5px;
          color: #94a3b8;
          pointer-events: none;
          transition: top 0.16s cubic-bezier(0.4,0,0.2,1),
                      font-size 0.16s cubic-bezier(0.4,0,0.2,1),
                      color 0.16s cubic-bezier(0.4,0,0.2,1),
                      transform 0.16s cubic-bezier(0.4,0,0.2,1);
          line-height: 1;
          white-space: nowrap;
        }
        .float-wrap .float-input:focus ~ .float-label,
        .float-wrap .float-input:not(:placeholder-shown) ~ .float-label {
          top: 11px;
          transform: translateY(0);
          font-size: 9.5px;
          color: #af936f;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .float-wrap .float-input:not(:focus):not(:placeholder-shown) ~ .float-label {
          color: #94a3b8;
        }

        @keyframes authShake {
          0%, 100% { transform: translateX(0); }
          15%  { transform: translateX(-7px); }
          30%  { transform: translateX(7px); }
          45%  { transform: translateX(-4px); }
          60%  { transform: translateX(4px); }
          75%  { transform: translateX(-2px); }
          90%  { transform: translateX(2px); }
        }
        .auth-shake {
          animation: authShake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
      <div className="min-h-dvh flex w-full">{children}</div>
    </>
  );
}

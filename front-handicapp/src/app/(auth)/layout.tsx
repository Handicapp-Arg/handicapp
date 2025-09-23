export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Layout minimalista sin Navbar/Footer
  return <div className="min-h-dvh flex w-full">{children}</div>;
}



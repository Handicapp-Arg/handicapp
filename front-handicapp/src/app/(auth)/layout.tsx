export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-gray-100 flex items-center justify-center px-4 py-8">
      {children}
    </div>
  );
}

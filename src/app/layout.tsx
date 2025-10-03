// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "DocBot",
  description: "Multi-agent docs chat",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">{children}</body>
    </html>
  );
}

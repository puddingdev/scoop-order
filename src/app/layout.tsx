import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scoop by Loki 🍨',
  description: 'กินก่อนแบกทีหลัง — สั่งไอศกรีม Delivery',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

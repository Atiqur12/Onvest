import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onvest — Digital KYC for fund managers',
  description: 'Digital KYC and investor onboarding for European fund managers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

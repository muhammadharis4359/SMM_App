import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BranDive SocialFlow AI | Multi-Platform Campaign Automation & Publishing',
  description:
    'Turn your brand, content, and goals into a platform-ready content calendar and publish approved content on schedule across Instagram, Facebook, LinkedIn, and YouTube.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

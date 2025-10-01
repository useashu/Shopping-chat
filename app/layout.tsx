import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MobileGenius - AI Phone Shopping Assistant',
  description: 'Get personalized phone recommendations with our AI-powered shopping assistant. Compare phones, understand features, and make informed decisions.',
  keywords: 'mobile phones, smartphone comparison, AI assistant, phone recommendations, mobile shopping',
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
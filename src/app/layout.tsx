import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import Background from './ui/common/background';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Diana Radio',
  description:
    'An alternative frontend project for NCM Podcast@嘉心糖周报. Powered by NEXT.JS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        <Script
          src="//at.alicdn.com/t/c/font_5032848_ibsqjcvczj.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Background />
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans_SC } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import Background from './ui/common/background';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  fallback: ['misans'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  fallback: ['Noto Sans SC'],
});

const notoSansCJKSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  subsets: [],
});

const misans = localFont({
  src: './assets/fonts/MiSans_VF.ttf',
  variable: '--font-misans',
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
          src="//at.alicdn.com/t/c/font_5032848_gnec1ern4c.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansCJKSC.variable} ${misans.variable} !font-sans antialiased`}
      >
        <Background />
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}

'use client';
import { Layout } from '@arco-design/web-react';
import NavBar from '../ui/main/nav_bar';

export default function MainPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen max-h-screen min-h-screen w-screen min-w-screen max-w-screen shrink-0">
      <Layout className="h-screen max-h-screen w-screen max-w-screen flex-1">
        <Layout.Header className="shadow">
          <NavBar />
        </Layout.Header>
        <Layout.Content className="flex-1 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            {children}
          </div>
        </Layout.Content>
      </Layout>
    </div>
  );
}

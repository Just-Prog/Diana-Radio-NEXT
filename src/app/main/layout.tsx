'use client';
import { Layout } from '@arco-design/web-react';
import NavBar from '../ui/main/nav_bar';

export default function MainPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full">
      <Layout>
        <Layout.Header className={'shadow'}>
          <NavBar />
        </Layout.Header>
        <Layout.Content>{children}</Layout.Content>
      </Layout>
    </div>
  );
}

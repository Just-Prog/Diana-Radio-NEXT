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
            <div className=" h-full w-full md:max-w[75%] md:h-[90%] md:w-[75%] overflow-auto md:rounded-2xl md:border-2 md:border-black/5 md:shadow-black/5 md:shadow-sm">
              {children}
            </div>
          </div>
        </Layout.Content>
        <Layout.Footer>
          <div className="py-8 shadow-black/100 shadow-lg">
            <div className="text-center">
              Diana Radio @Diana_Weekly, 2025{' '}
              <a
                className="duration-500 ease-in-out hover:text-[#e799b0]"
                href="https://space.bilibili.com/672328094"
              >
                @嘉然今天吃什么
              </a>
            </div>
          </div>
        </Layout.Footer>
      </Layout>
    </div>
  );
}

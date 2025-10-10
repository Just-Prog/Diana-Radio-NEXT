'use client';
import { Button } from '@arco-design/web-react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import LogoHorizon from '@/app/assets/logo_horizon.png';

export default function NavBar() {
  const pathname = usePathname();
  const [pathNow, setPathNow] = useState<string[]>([]);

  useEffect(() => {
    setPathNow([pathname]);
  }, [pathname]);

  return (
    <div className="flex h-14 w-full flex-row items-center justify-start gap-x-8 bg-white px-10 py-2">
      <Link className="my-2 block cursor-pointer p-auto" href="/">
        <Image
          alt=""
          className="mr-auto ml-auto w-22 object-contain"
          src={LogoHorizon}
        />
      </Link>
      <div className="flex flex-row gap-x-4">
        <Link href="/main">
          <Button className="!text-black !font-bold" type="text">
            主页
          </Button>
        </Link>
        <Link href="/about">
          <Button className="!text-black !font-bold" type="text">
            关于
          </Button>
        </Link>
      </div>
    </div>
  );
}

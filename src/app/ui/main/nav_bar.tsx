'use client';
import { Button } from '@arco-design/web-react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import LogoHorizon from '@/app/assets/logo_horizon.png';

interface NavBarItemProps {
  href: string;
  desc: string;
}

export default function NavBar() {
  const pathname = usePathname();
  const [pathNow, setPathNow] = useState<string[]>([]);

  const NavBarItem: React.FC<NavBarItemProps> = ({ href, desc }) => {
    return (
      <Link href={href}>
        <Button
          className={`${pathNow[0] && pathNow[0] === href ? '!text-[#e79dad]' : '!text-black'} !font-bold`}
          type="text"
        >
          {desc}
        </Button>
      </Link>
    );
  };

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
        <NavBarItem desc="主页" href="/main" />
        <NavBarItem desc="关于" href="/about" />
      </div>
    </div>
  );
}

'use client';
import { Menu } from '@arco-design/web-react';

const MenuItem = Menu.Item;

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
    <Menu
      defaultSelectedKeys={pathNow}
      mode="horizontal"
      selectedKeys={pathNow}
    >
      <MenuItem className="cursor-pointer!" disabled key="/">
        <Link href="/">
          <Image alt="" className="w-24 object-contain" src={LogoHorizon} />
        </Link>
      </MenuItem>
      <MenuItem key="/main">
        <Link href="/main">主页</Link>
      </MenuItem>
      <MenuItem key="/about">
        <Link href="/about">关于</Link>
      </MenuItem>
    </Menu>
  );
}

"use client";
import { Button } from "@arco-design/web-react";
import { IconGithub } from "@arco-design/web-react/icon";
import { Popover } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoHorizon from "@/app/assets/logo_horizon.png";

interface NavBarItemProps {
  href: string;
  desc: string;
}

export default function NavBar() {
  const pathname = usePathname();
  const [pathNow, setPathNow] = useState<string[]>([]);

  const NavBarItem: React.FC<NavBarItemProps> = ({ href, desc }) => (
    <Link href={href}>
      <Button
        className={`${pathNow[0] && pathNow[0] === href ? "!text-[#e79dad]" : "!text-black"} !font-bold`}
        type="text"
      >
        {desc}
      </Button>
    </Link>
  );

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
      <div className="flex flex-1 flex-row gap-x-3">
        <NavBarItem desc="主页" href="/main" />
        <NavBarItem desc="关于" href="/about" />
      </div>
      <div className="flex">
        <Popover content={<span>GitHub</span>}>
          <IconGithub
            className="text-xl hover:text-[#e799b0]!"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.open(
                  "https://github.com/Just-Prog/Diana-Radio-NEXT",
                  "_blank"
                );
              }
            }}
          />
        </Popover>
      </div>
    </div>
  );
}

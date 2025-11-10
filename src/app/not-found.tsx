import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";

import Link from "next/link";
import image from "@/app/assets/404.png";
import Divider from "./ui/common/divider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404 - Diana Audio",
  description: "啊这，小然不知道哦",
};

export default function GlobalNotFound() {
  return (
    <html lang="zh">
      <body>
        <div
          className={`${inter.variable} ${mono.variable} flex h-screen min-h-screen w-full items-center justify-center px-4 antialiased`}
        >
          <div className="flex flex-row gap-x-4">
            <div className="flex">
              <Image alt="" className="h-45 w-45 object-contain" src={image} />
            </div>
            <Divider />
            <div className="flex h-auto flex-col justify-center gap-y-2">
              <span className="font-mono font-semibold text-lg">
                404 Not Found
              </span>
              <span className="font-bold text-2xl">啊这，小然不知道哦</span>
              <Link href="/">返回首页</Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

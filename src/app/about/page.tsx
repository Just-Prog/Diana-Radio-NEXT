"use client";
import { IconGithub, IconVideoCamera } from "@arco-design/web-react/icon";
import Image from "next/image";
import logo from "@/app/assets/logo_horizon.png";
import Divider from "../ui/common/divider";

const AboutPage = () => (
  <div className="flex flex-col justify-center px-8 py-4 md:flex-row">
    <div className="flex items-center justify-center">
      <Image
        alt="logo"
        className="h-full w-3xs self-center object-contain"
        src={logo}
      />
    </div>
    <Divider />
    <div className="flex flex-col justify-center text-center md:py-8 md:text-left">
      <div className="font-bold text-3xl">Diana Radio 嘉然电台</div>
      <div className="font-normal text-lg">不只是为 NCM 适配的替代前端页面</div>
      <div className="flex flex-row items-center gap-x-1 font-normal text-lg">
        <IconVideoCamera className="text-[#e799b0]!" />
        <span
          className="mr-2"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.open("https://space.bilibili.com/247210788", "_blank");
            }
          }}
        >
          @嘉心糖周报
        </span>
        <IconGithub />
        <span
          onClick={() => {
            if (typeof window !== "undefined") {
              window.open("https://github.com/Just-Prog", "_blank");
            }
          }}
        >
          @Just-Prog
        </span>
      </div>
    </div>
  </div>
);

export default AboutPage;

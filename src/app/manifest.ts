import type { MetadataRoute } from "next";
import icon from "./icon.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "嘉然电台FM.307/Diana Radio",
    short_name: "Diana Radio",
    description:
      "An alternative frontend project for NCM Podcast@嘉心糖周报. Powered by NEXT.JS",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e799b0",
    icons: [
      {
        src: icon.src,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

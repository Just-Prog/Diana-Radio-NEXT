"use client";
import { Modal, Notification, Switch } from "@arco-design/web-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getPlaylistManager } from "../lib/player/ncm/playlistManager";
import IconFont from "../ui/common/iconfont";
import LiveIndicator from "../ui/main/live_indicator";
import PlayerBilibili from "../ui/player/platform/bilibili/player";
import PlaylistBilibili from "../ui/player/platform/bilibili/playlist";
import Player, { programCover } from "../ui/player/platform/ncm/player";
import Playlist from "../ui/player/platform/ncm/playlist";

type SongInfo = {
  date: string;
  id: string;
  pid: number;
  name: string;
  type?: "songs" | "sleep" | "jianwen" | "hachimi";
  playTime: number;
};

type SongInfoBilibili = {
  id: number;
  author: string;
  mid: number;
  typeid: string;
  typename: string;
  arcurl: string;
  aid: number;
  bvid: string;
  title: string;
  description: string;
  pic: string;
  upic: string;
  play: number;
  video_review: number;
  favorites: number;
  tag: string;
  review: number;
  pubdate: number;
  senddate: number;
  duration: string;
  danmaku: number;
};

export default function MainPage() {
  const [notification, contextHolder] = Notification.useNotification({
    maxCount: 1,
  });
  const [isClient, setIsClient] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState<SongInfo>();
  const [currentPlayingBilibili, setCurrentPlayingBilibili] =
    useState<SongInfoBilibili>();
  const [playlistOpened, setPlaylistOpened] = useState<boolean>(false);
  const [isBilibiliMode, setIsBilibiliMode] = useState<boolean | undefined>(
    undefined
  );
  const playlistManager = getPlaylistManager();

  const setupServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js", {
          scope: "/",
        })
        .then((_) => {
          console.log("service worker registered succesfully");
        })
        .catch((_) => {
          console.warn(
            "oops there's something wrong registering service worker",
            _
          );
        });
    }
  };

  // 处理播放器事件
  useEffect(() => {
    setIsClient(true);
    setIsBilibiliMode(localStorage.getItem("player_platform") === "bilibili");
    setupServiceWorker();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "player_platform",
      isBilibiliMode ? "bilibili" : "ncm_podcast"
    );
    const handleSongChanged = (event: CustomEvent) => {
      setCurrentPlaying(event.detail);
    };

    const handleSongEnded = (event: CustomEvent) => {
      setCurrentPlaying(event.detail);
    };
    if (isBilibiliMode) {
      window.removeEventListener(
        "songChanged",
        handleSongChanged as EventListener
      );
      window.removeEventListener("songEnded", handleSongEnded as EventListener);
    } else {
      window.addEventListener(
        "songChanged",
        handleSongChanged as EventListener
      );
      window.addEventListener("songEnded", handleSongEnded as EventListener);
      const restoredSong = playlistManager.getCurrentSong();
      if (restoredSong) {
        setCurrentPlaying(restoredSong);
      }
    }
    return () => {
      window.removeEventListener(
        "songChanged",
        handleSongChanged as EventListener
      );
      window.removeEventListener("songEnded", handleSongEnded as EventListener);
    };
  }, [isBilibiliMode]);

  return (
    <>
      {contextHolder}
      <div
        className="flex h-full max-w-full flex-1 flex-col overflow-y-auto overflow-x-hidden md:flex-row"
        id="player_card"
      >
        {/* <div className="h-full bg-linear-120 from-pink-400 to-orange-300 backdrop-blur-lg md:flex-3"> */}
        <div className="h-full backdrop-blur-lg md:flex-3">
          <LiveIndicator />
          <div className="absolute top-4 right-4 flex flex-row justify-end gap-x-2 p-2">
            <span className="flex flex-row items-center gap-x-2 text-sm">
              <p className="text-sm">
                模式：{isBilibiliMode ? "Bilibili" : "播客"}
              </p>
              <Switch
                checked={isBilibiliMode}
                onChange={(v) => setIsBilibiliMode(v)}
              />
            </span>
            {isClient && (
              <div
                className="cursor-pointer"
                onClick={() => {
                  if (
                    navigator?.serviceWorker &&
                    navigator?.serviceWorker?.controller
                  ) {
                    navigator?.serviceWorker?.controller.postMessage({
                      action: "CACHE_CLEAR",
                    });
                    notification.info?.({
                      title: "清理缓存",
                      content: <span>已尝试清理。</span>,
                    });
                  }
                }}
              >
                <IconFont
                  className="!text-2xl z-[99] w-4 text-black"
                  type="icon-qinglihuancun"
                />
              </div>
            )}
          </div>

          <div
            className={`-z-10 absolute h-full w-full flex-1 overflow-clip ${isBilibiliMode !== undefined && "bg-[#e799b0]"}`}
          >
            <div className="flex h-full min-h-full w-full min-w-full flex-1 blur-xl">
              {isBilibiliMode !== undefined &&
                (isBilibiliMode ? (
                  // biome-ignore lint/performance/noImgElement: ***
                  <img
                    alt=""
                    className={"h-full w-full object-cover object-center"}
                    crossOrigin="anonymous"
                    height={0}
                    referrerPolicy="no-referrer"
                    src={currentPlayingBilibili?.pic ?? undefined}
                    width={300}
                  />
                ) : (
                  <Image
                    alt=""
                    className={"h-full w-full object-cover object-center"}
                    height={0}
                    src={
                      programCover[
                        (currentPlaying as SongInfo)?.type ?? "songs"
                      ]
                    }
                    width={300}
                  />
                ))}
            </div>
          </div>
          <div className="flex h-full max-h-full w-full max-w-full">
            {isBilibiliMode !== undefined &&
              (isBilibiliMode ? (
                <PlayerBilibili
                  notification={notification}
                  setSongInfo={setCurrentPlayingBilibili}
                  songInfo={currentPlayingBilibili as SongInfoBilibili}
                  togglePlaylist={() => setPlaylistOpened(true)}
                />
              ) : (
                <Player
                  notification={notification}
                  songInfo={currentPlaying as SongInfo}
                  togglePlaylist={() => setPlaylistOpened(true)}
                />
              ))}
          </div>
        </div>
      </div>
      <Modal
        className="!w-[90%] md:!w-[60%] flex overflow-hidden"
        footer={null}
        onCancel={() => setPlaylistOpened(false)}
        visible={playlistOpened}
      >
        <div className="flex h-[calc(90vh-48px)] w-full flex-1 md:h-[80vh]">
          {isBilibiliMode !== undefined &&
            (isBilibiliMode ? (
              <PlaylistBilibili
                currentPlaying={currentPlayingBilibili as SongInfoBilibili}
                setCurrentPlaying={(v: SongInfoBilibili) => {
                  setCurrentPlayingBilibili(v);
                  setPlaylistOpened(false);
                }}
              />
            ) : (
              <Playlist
                currentPlaying={currentPlaying as SongInfo}
                playlistOpened={playlistOpened}
                setCurrentPlaying={(v) => {
                  setCurrentPlaying(v);
                  setPlaylistOpened(false);
                }}
              />
            ))}
        </div>
      </Modal>
    </>
  );
}

export type { SongInfo, SongInfoBilibili };

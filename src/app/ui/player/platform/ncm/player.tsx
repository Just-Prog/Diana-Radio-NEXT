"use client";
import {
  type NotificationHookReturnType,
  Popover,
} from "@arco-design/web-react";
import {
  IconBackward,
  IconForward,
  IconLoading,
  IconLoop,
  IconMenuFold,
  IconMute,
  IconPause,
  IconPlayArrow,
  IconSkipNext,
  IconSkipPrevious,
  IconSound,
} from "@arco-design/web-react/icon";
import { Slider } from "antd";
import Image from "next/image";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DianaWeeklyAvailableProgramsInfo } from "@/app/api/podcast/constants";
import playerBG from "@/app/assets/program/bg.png";
import { PODCAST_AUDIO_FETCH } from "@/app/lib/axios/constants";
import Request from "@/app/lib/axios/request";
import { getPlaylistManager } from "@/app/lib/player/ncm/playlistManager";
import { ts2mmss } from "@/app/lib/utils/timestamp";
import type { SongInfo } from "@/app/main/page";
import IconFont from "@/app/ui/common/iconfont";
import { LyricDisplayArea, LyricSwitch } from "./lyrics";

const programCover = DianaWeeklyAvailableProgramsInfo.reduce(
  (acc, program) => {
    acc[program.key] = program.cover;
    return acc;
  },
  {} as Record<string, any>
);

const PlayerControllerButton: React.FC<{
  children: ReactNode;
  action?: () => void;
}> = ({ children, action }) => {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: shut up
    // biome-ignore lint/a11y/noStaticElementInteractions: shut up
    // biome-ignore lint/a11y/useKeyWithClickEvents: shut up biome
    <div
      className="flex cursor-pointer flex-row items-center justify-center rounded-2xl px-1 pt-1 pb-1 text-lg duration-400 hover:bg-[#e799b0]/60 md:px-2"
      onClick={(event) => {
        event.stopPropagation;
        action?.();
      }}
    >
      <div className="flex flex-1 items-center justify-center px-2 py-1 opacity-45 hover:opacity-80">
        {children}
      </div>
    </div>
  );
};

const Player: React.FC<{
  notification: NotificationHookReturnType;
  songInfo: SongInfo | undefined;
  togglePlaylist: () => void;
}> = ({ songInfo, togglePlaylist, notification }) => {
  const player = useRef<HTMLAudioElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState<boolean | "loading">(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const [lyrics, setLyrics] = useState([]);

  const [isVolumeControllerVisible, setIsVolumeControllerVisible] =
    useState<boolean>(false);

  const [isLyricBarEnabled, setIsLyricBarEnabled] = useState(true);

  const playlistManager = getPlaylistManager();

  const play = async () => {
    if (player.current) {
      await player.current.play();
      setPaused(false);
    }
  };

  const pause = () => {
    if (player.current) {
      player.current.pause();
      setPaused(true);
    }
  };

  const seek = (v: number) => {
    if (player.current) {
      player.current.currentTime = v;
    }
  };

  const changeVolume = (v: number) => {
    if (player.current) {
      player.current.volume = v;
    }
  };

  useEffect(() => {
    changeVolume(volume);
  }, [volume]);

  const toggleLoopStatus = () => {
    if (player.current) {
      player.current.loop = !loop;
      setLoop(!loop);
    }
  };

  const toggleShuffleStatus = () => {
    const newShuffleState = !shuffle;
    setShuffle(newShuffleState);
    playlistManager.setShuffleEnabled(newShuffleState);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <?>
  const fetchProgramURL = useCallback(async () => {
    if (songInfo?.id) {
      setPaused("loading");
      const data = await Request.get(`${PODCAST_AUDIO_FETCH}${songInfo?.id}`);
      if (player.current) {
        player.current.src = data.data.data.url.replace("http://", "https://");
      }
      try {
        await play();
        setLyrics(data.data.data.lrc ?? []);
        setupMediaSessionMetadata();
      } catch (e: any) {
        notification.info?.({
          title: "自动播放失败",
          content: (
            <span>
              请手动点击播放键重试。
              <br /> {e.toString()}
            </span>
          ),
        });
        setPaused(true);
      }
    } else {
      return;
    }
  }, [songInfo]);

  const togglePlayPause = async () => {
    if (!songInfo?.id) {
      notification.error?.({
        title: "提示",
        content: <span>请选择歌曲后重试</span>,
      });
      return;
    }
    setPaused("loading");
    if (paused) {
      await play();
    } else {
      pause();
    }
    setPaused(!paused);
  };

  const initShuffleStatus = () => {
    setShuffle(playlistManager.getShuffleEnabled());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: ？
  useEffect(() => {
    fetchProgramURL();
  }, [songInfo]);

  useEffect(() => {
    if (player.current) {
      player.current.onended = (_) => {
        const nextSong = playlistManager.playNext();
        if (nextSong) {
          window.dispatchEvent(
            new CustomEvent("songEnded", { detail: nextSong })
          );
        } else {
          pause();
        }
      };
    }
  }, [player.current]);

  useEffect(() => {
    const audio = player.current;

    if (audio) {
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedData = () => setDuration(audio.duration);

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadeddata", handleLoadedData);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadeddata", handleLoadedData);
      };
    }
  }, []);

  const initMediaSession = () => {
    if ("mediaSession" in navigator) {
      console.log("环境支持MediaSession");

      navigator.mediaSession.setActionHandler("play", async () => {
        await play();
        navigator.mediaSession.playbackState = "playing";
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        pause();
        navigator.mediaSession.playbackState = "paused";
      });
      navigator.mediaSession.setActionHandler("stop", () => {
        pause();
        navigator.mediaSession.playbackState = "none";
      });
    } else {
      console.log("MediaSession不可用");
    }
  };

  const setupMediaSessionMetadata = useCallback(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songInfo?.name,
        artist: "Diana Radio",
        album: DianaWeeklyAvailableProgramsInfo.find(
          (v) => v.key === songInfo?.type
        )?.name,
        artwork: [
          {
            src: programCover[songInfo?.type ?? "songs"].src,
            sizes: "512x512",
          },
        ],
      });
      navigator.mediaSession.playbackState = "playing";
    }
  }, [songInfo]);

  useEffect(() => {
    initMediaSession();
    toggleLoopStatus();
    initShuffleStatus();
  }, []);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = paused ? "paused" : "playing";
    }
  }, [paused]);

  const onClickProgressBar = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !songInfo?.id) {
      return;
    }
    if (event.nativeEvent.offsetX >= 0) {
      const clickPos = event.nativeEvent.offsetX;
      const progBarWidth = progressBar.current?.clientWidth ?? 1;
      const target =
        (player.current?.duration ?? 0) * (clickPos / progBarWidth);
      seek(Number.isNaN(target) ? 0 : target);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!songInfo?.id) {
      return;
    }
    setIsDragging(true);
    const rect = progressBar.current?.getBoundingClientRect();
    if (rect) {
      const clickPos = event.clientX - rect.left;
      const progBarWidth = rect.width;
      const progress = Math.max(0, Math.min(1, clickPos / progBarWidth));
      setDragProgress(progress);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) {
      return;
    }

    const rect = progressBar.current?.getBoundingClientRect() ?? {
      left: 0,
      width: 0,
    };
    const movPos = event.clientX - rect.left;
    const progBarWidth = rect.width;
    const progress = Math.max(0, Math.min(1, movPos / progBarWidth));
    setDragProgress(progress);
  };

  const handleMouseUp = (event: MouseEvent) => {
    const rect = progressBar.current?.getBoundingClientRect() ?? {
      left: 0,
      width: 0,
    };
    const movEnd = event.clientX - rect.left;
    const progBarWidth = rect.width;
    const progress = Math.max(0, Math.min(1, movEnd / progBarWidth));
    const targetTime = (duration ?? 0) * progress;
    seek(targetTime);
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (!songInfo?.id) {
      return;
    }
    setIsDragging(true);
    const rect = progressBar.current?.getBoundingClientRect();
    if (rect) {
      const touch = event.touches[0];
      const clickPos = touch.clientX - rect.left;
      const progBarWidth = rect.width;
      const progress = Math.max(0, Math.min(1, clickPos / progBarWidth));
      setDragProgress(progress);
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!isDragging) {
      return;
    }

    const rect = progressBar.current?.getBoundingClientRect() ?? {
      left: 0,
      width: 0,
    };
    const touch = event.touches[0];
    const movPos = touch.clientX - rect.left;
    const progBarWidth = rect.width;
    const progress = Math.max(0, Math.min(1, movPos / progBarWidth));
    setDragProgress(progress);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const rect = progressBar.current?.getBoundingClientRect() ?? {
      left: 0,
      width: 0,
    };
    const touch = event.changedTouches[0];
    const movEnd = touch.clientX - rect.left;
    const progBarWidth = rect.width;
    const progress = Math.max(0, Math.min(1, movEnd / progBarWidth));
    const targetTime = (duration ?? 0) * progress;
    seek(targetTime);
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: shutup
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <div className="flex h-full select-none flex-col items-center justify-center gap-y-8">
          <div
            className={`animate-[spin_3s_linear_infinite] overflow-clip rounded-[50%] shadow-black shadow-xl/10 ${paused && "pause-animation"} flex items-center justify-center`}
            onClick={async () => {
              await togglePlayPause();
            }}
          >
            <Image alt="bg" className={"h-50 w-50"} src={playerBG} />
            <Image
              alt="cover"
              className={"absolute h-35 w-35 rounded-[50%]"}
              src={programCover[songInfo?.type ?? "songs"]}
            />
          </div>

          <div className="flex flex-col items-center gap-y-2 px-8 text-center">
            <span className="font-bold text-black/85 text-xl md:text-2xl">
              {songInfo?.name ?? "Diana Radio"}
            </span>
            <span className="font-normal text-black/85 text-sm md:text-lg">
              {songInfo?.type
                ? DianaWeeklyAvailableProgramsInfo.find(
                    (v) => v.key === songInfo?.type
                  )?.name
                : "未选择"}
            </span>
          </div>
          {isLyricBarEnabled && (
            <LyricDisplayArea
              current={currentTime}
              lyrics={
                lyrics.length > 0 ? lyrics : [{ time: 0, text: "暂无歌词" }]
              }
            />
          )}
        </div>
      </div>
      {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: ? */}
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: ? */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: ? */}
      <div
        className={"h-2 w-full bg-[#fff]"}
        onClick={onClickProgressBar}
        ref={progressBar}
      >
        <div
          className={"flex h-full flex-col justify-center bg-[#e799b0]"}
          style={{
            width: `${isDragging ? dragProgress * 100 : Number.isNaN(currentTime / duration) ? 0 : (currentTime / duration) * 100}%`,
          }}
        >
          <IconFont
            className={"-right-2 absolute z-[99] w-4 cursor-pointer"}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            size={24}
            style={{
              left: `calc(${isDragging ? dragProgress * 100 : Number.isNaN(currentTime / duration) ? 0 : (currentTime / duration) * 100}% - 12px)`, // 偏移一半
            }}
            type="icon-yuandian"
          />
        </div>
        <div className="-top-10 relative my-1.5 flex w-full flex-row justify-between px-2 text-sm">
          <span>{ts2mmss(currentTime, "s")}</span>
          <span>{ts2mmss(duration, "s")}</span>
        </div>
      </div>
      <div className="flex h-16 w-full items-center justify-center bg-white/60 backdrop-blur-lg">
        {/** biome-ignore lint/a11y/useMediaCaption: 不需要 */}
        <audio ref={player} />
        <div className="flex gap-x-1/3 md:gap-x-4">
          <PlayerControllerButton
            action={() => {
              const previousSong = playlistManager.playPrevious();
              if (previousSong) {
                // 通知父组件更新当前播放歌曲
                window.dispatchEvent(
                  new CustomEvent("songChanged", { detail: previousSong })
                );
              } else {
                notification.warning?.({
                  title: "提示",
                  content: <span>没有上一首歌曲</span>,
                });
              }
            }}
          >
            <IconSkipPrevious />
          </PlayerControllerButton>
          <PlayerControllerButton action={() => seek(currentTime - 5)}>
            <IconBackward />
          </PlayerControllerButton>
          <PlayerControllerButton action={togglePlayPause}>
            {paused === "loading" ? (
              <IconLoading />
            ) : paused ? (
              <IconPlayArrow />
            ) : (
              <IconPause />
            )}
          </PlayerControllerButton>
          <PlayerControllerButton action={() => seek(currentTime + 5)}>
            <IconForward />
          </PlayerControllerButton>
          <PlayerControllerButton
            action={() => {
              const nextSong = playlistManager.playNext();
              if (nextSong) {
                // 通知父组件更新当前播放歌曲
                window.dispatchEvent(
                  new CustomEvent("songChanged", { detail: nextSong })
                );
              } else {
                notification.warning?.({
                  title: "提示",
                  content: <span>没有下一首歌曲</span>,
                });
              }
            }}
          >
            <IconSkipNext />
          </PlayerControllerButton>
          <PlayerControllerButton
            action={() => {
              if (!isVolumeControllerVisible) {
                setIsVolumeControllerVisible(true);
              }
            }}
          >
            <Popover
              // 这玩意关闭的时候会拉一坨 `<div style="width: 100%; position: absolute; top: 0px; left: 0px;"></div>` 到body
              // 离谱
              content={
                <div className="flex flex-1 flex-row items-center justify-center gap-x-2">
                  <IconMute
                    className="text-lg"
                    style={{
                      color:
                        volume > 0
                          ? "var(--color-text-4)"
                          : "var(--color-text-1)",
                    }}
                  />
                  {/* 字节没给滑动输入条这玩意加触摸屏适配 */}
                  {/* 懒得喷.jpg */}
                  <Slider
                    max={100}
                    onChange={(val) => {
                      setVolume(val / 100.0);
                    }}
                    step={1}
                    style={{ width: "153px" }}
                    value={volume * 100}
                  />
                  <IconSound
                    className="text-lg"
                    style={{
                      color:
                        volume === 0
                          ? "var(--color-text-4)"
                          : "var(--color-text-1)",
                    }}
                  />
                </div>
              }
              onVisibleChange={(v) => setIsVolumeControllerVisible(v)}
              popupVisible={isVolumeControllerVisible}
            >
              {volume === 0 ? <IconMute /> : <IconSound />}
            </Popover>
          </PlayerControllerButton>
          <PlayerControllerButton action={toggleShuffleStatus}>
            <div className="relative h-4 w-4">
              <div className="flex flex-1 items-center justify-center">
                <IconFont
                  className={shuffle ? "text-[#e799b0]" : "text-black"}
                  size={18}
                  type="icon-suijibofang"
                />
                {!shuffle && (
                  <IconFont
                    className="-right-0.5 -bottom-0.5 absolute z-10 stroke-4! stroke-black!"
                    size={10}
                    type="icon-icon-close"
                  />
                )}
              </div>
            </div>
          </PlayerControllerButton>
          <PlayerControllerButton action={toggleLoopStatus}>
            <IconLoop spin={loop} />
          </PlayerControllerButton>
          <PlayerControllerButton
            action={() => setIsLyricBarEnabled(!isLyricBarEnabled)}
          >
            <div>
              <LyricSwitch isLyricAreaEnabled={isLyricBarEnabled} />
            </div>
          </PlayerControllerButton>
          <PlayerControllerButton action={togglePlaylist}>
            <IconMenuFold />
          </PlayerControllerButton>
        </div>
      </div>
    </div>
  );
};

export default Player;
export { programCover };

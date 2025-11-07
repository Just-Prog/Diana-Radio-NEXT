'use client';
import {
  type NotificationHookReturnType,
  Popover,
} from '@arco-design/web-react';
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
} from '@arco-design/web-react/icon';
import { Slider } from 'antd';
import { AxiosError } from 'axios';
import Image from 'next/image';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import LOGO from '@/app/assets/logo.png';
import { BILIBILI_DATA_FETCH } from '@/app/lib/axios/constants';
import Request from '@/app/lib/axios/request';
import { ts2mmss } from '@/app/lib/utils/timestamp';
import type { SongInfoBilibili } from '@/app/main/page';
import IconFont from '@/app/ui/common/iconfont';
import { BilibiliLogoSVG } from '@/app/ui/common/logo/bilibili';

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
      <div className="flex-1 px-2 py-1 opacity-45 hover:opacity-80">
        {children}
      </div>
    </div>
  );
};

const PlayerBilibili: React.FC<{
  notification: NotificationHookReturnType;
  songInfo: SongInfoBilibili | undefined;
  setSongInfo: (v: SongInfoBilibili | undefined) => void;
  togglePlaylist: () => void;
}> = ({ songInfo, togglePlaylist, notification, setSongInfo }) => {
  const player = useRef<HTMLAudioElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState<boolean | 'loading'>(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loop, setLoop] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const [isVolumeControllerVisible, setIsVolumeControllerVisible] =
    useState<boolean>(false);

  const [songInfoBK, setSongInfoBK] = useState<SongInfoBilibili | undefined>();

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <?>
  const fetchBilibiliVidData = useCallback(async () => {
    if (songInfo?.bvid && songInfo?.bvid !== songInfoBK?.bvid) {
      try {
        setPaused('loading');
        const cid_list = (
          await Request.get(`${BILIBILI_DATA_FETCH}${songInfo?.bvid}`)
        ).data;
        const data = (
          await Request.get(
            `${BILIBILI_DATA_FETCH}${songInfo?.bvid}/${cid_list.data[0].cid}`
          )
        ).data;
        const target = data.data.base_url;
        const backup_target = data.data.backup_url[0];
        const mime = data.data.mime_type;
        let blob: Blob;
        try {
          blob = (
            await Request.post(
              `${BILIBILI_DATA_FETCH}proxy`,
              {
                target,
                mime,
              },
              {
                responseType: 'blob',
              }
            )
          ).data;
        } catch (e: any) {
          if (e instanceof AxiosError && e.status === 403) {
            blob = (
              await Request.post(
                `${BILIBILI_DATA_FETCH}proxy`,
                {
                  target: backup_target,
                  mime,
                },
                {
                  responseType: 'blob',
                }
              )
            ).data;
          }
        }
        if (player.current) {
          player.current.src = URL.createObjectURL(blob);
        }
        await play();
        setupMediaSessionMetadata();
        setSongInfoBK(songInfo);
      } catch (e: any) {
        notification.info?.({
          title: '播放失败',
          content: (
            <span>
              请手动重试。
              <br />
              {e.message}
            </span>
          ),
        });
        setSongInfo(songInfoBK);
      }
    } else {
      return;
    }
  }, [songInfo]);

  const togglePlayPause = async () => {
    if (!songInfo?.id) {
      notification.error?.({
        title: '提示',
        content: <span>请选择歌曲后重试</span>,
      });
      return;
    }
    setPaused('loading');
    if (paused) {
      await play();
      setupMediaSessionMetadata();
    } else {
      pause();
    }
    setPaused(!paused);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: ？
  useEffect(() => {
    fetchBilibiliVidData();
  }, [songInfo]);

  useEffect(() => {
    if (player.current) {
      player.current.onended = () => pause();
    }
  }, [player.current]);

  useEffect(() => {
    const audio = player.current;

    if (audio) {
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedData = () => setDuration(audio.duration);

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadeddata', handleLoadedData);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, []);

  const initMediaSession = () => {
    if ('mediaSession' in navigator) {
      console.log('环境支持MediaSession');

      navigator.mediaSession.setActionHandler('play', async () => {
        await play();
        navigator.mediaSession.playbackState = 'playing';
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
        navigator.mediaSession.playbackState = 'paused';
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        pause();
        navigator.mediaSession.playbackState = 'none';
      });
    } else {
      console.log('MediaSession不可用');
    }
  };

  // Chrome 142.0.7444.59 on Linux 的媒体面板有问题无法显示所有元数据，但是一部分元数据能被桌面环境抓到
  // Edge 142.0.3595.53 on Linux 没这个问题，Safari on iOS 26.1 RC 也没有问题
  // 离谱
  const setupMediaSessionMetadata = useCallback(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songInfo?.title,
        artist: songInfo?.author,
        album: '',
        artwork: [
          {
            src: songInfo?.pic ?? LOGO.src,
          },
        ],
      });
      navigator.mediaSession.playbackState = 'playing';
    }
  }, [songInfo]);

  useEffect(() => {
    initMediaSession();
    toggleLoopStatus();
  }, []);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = paused ? 'paused' : 'playing';
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
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <div className="flex h-full select-none flex-col items-center justify-center gap-y-8">
          {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          <div
            className={`flex h-36 w-64 items-center justify-center overflow-clip rounded-lg shadow-black shadow-xl/10 md:h-72 md:w-128 ${songInfo?.pic ?? 'bg-[#f0b5c7] text-white/65'}`}
            onClick={async () => {
              await togglePlayPause();
            }}
          >
            <div
              className={`absolute top-auto left-auto z-10 ${paused && songInfo?.pic ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            >
              <Image
                alt="bilibili pause button"
                height={96}
                referrerPolicy="no-referrer"
                src={'https://s1.hdslb.com/bfs/static/player/img/play.svg'}
                width={96}
              />
            </div>
            {songInfo?.pic ? (
              // biome-ignore lint/performance/noImgElement: why?
              <img
                alt="cover"
                className={
                  'h-36 w-64 object-cover object-center md:h-72 md:w-128'
                }
                crossOrigin="anonymous"
                height={0}
                referrerPolicy="no-referrer"
                src={songInfo?.pic ?? null}
                width={0}
              />
            ) : (
              <BilibiliLogoSVG size={72} />
            )}
          </div>

          <div className="flex flex-col items-center gap-y-2 px-8 text-center">
            <span className="font-bold text-black/85 text-xl md:text-2xl">
              {songInfo?.title ?? 'Bilibili'}
            </span>
            <span className="flex flex-row items-center gap-x-2 font-normal text-black/85 text-sm md:text-lg">
              {/** biome-ignore lint/performance/noImgElement: <explanation> */}
              <img
                alt=""
                className={
                  'h-6 w-6 overflow-clip rounded-[50%] bg-gray-600 object-contain'
                }
                height={24}
                referrerPolicy="no-referrer"
                src={
                  songInfo?.upic ??
                  'https://i2.hdslb.com/bfs/face/member/noface.jpg@96w_96h.avif'
                }
                width={24}
              />
              <p>{songInfo?.author ?? '未选择'}</p>
            </span>
          </div>
        </div>
      </div>
      {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: ? */}
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: ? */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: ? */}
      <div
        className={'h-2 w-full bg-[#fff]'}
        onClick={onClickProgressBar}
        ref={progressBar}
      >
        <div
          className={'flex h-full flex-col justify-center bg-[#e799b0]'}
          style={{
            width: `${isDragging ? dragProgress * 100 : Number.isNaN(currentTime / duration) ? 0 : (currentTime / duration) * 100}%`,
          }}
        >
          <IconFont
            className={'-right-2 absolute z-[99] w-4 cursor-pointer'}
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
          <span>{ts2mmss(currentTime, 's')}</span>
          <span>{ts2mmss(duration, 's')}</span>
        </div>
      </div>
      <div className="flex h-16 w-full items-center justify-center bg-white/60 backdrop-blur-lg">
        {/** biome-ignore lint/a11y/useMediaCaption: 不需要 */}
        <audio crossOrigin="anonymous" ref={player} />
        <div className="flex gap-x-1/3 md:gap-x-4">
          <PlayerControllerButton
            action={() => {
              notification.warning?.({
                title: '提示',
                content: <span>Not implemented</span>,
              });
            }}
          >
            <IconSkipPrevious />
          </PlayerControllerButton>
          <PlayerControllerButton action={() => seek(currentTime - 5)}>
            <IconBackward />
          </PlayerControllerButton>
          <PlayerControllerButton action={togglePlayPause}>
            {paused === 'loading' ? (
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
              notification.warning?.({
                title: '提示',
                content: <span>Not implemented</span>,
              });
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
              content={
                <div className="flex flex-1 flex-row items-center justify-center gap-x-2">
                  <IconMute
                    className="text-lg"
                    style={{
                      color:
                        volume > 0
                          ? 'var(--color-text-4)'
                          : 'var(--color-text-1)',
                    }}
                  />
                  <Slider
                    max={100}
                    onChange={(val) => {
                      setVolume(val / 100.0);
                    }}
                    step={1}
                    style={{ width: '153px' }}
                    value={volume * 100}
                  />
                  <IconSound
                    className="text-lg"
                    style={{
                      color:
                        volume === 0
                          ? 'var(--color-text-4)'
                          : 'var(--color-text-1)',
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
          <PlayerControllerButton action={toggleLoopStatus}>
            <IconLoop spin={loop} />
          </PlayerControllerButton>
          <PlayerControllerButton action={togglePlaylist}>
            <IconMenuFold />
          </PlayerControllerButton>
        </div>
      </div>
    </div>
  );
};

export default PlayerBilibili;

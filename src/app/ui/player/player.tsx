'use client';
import {
  Icon,
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
  IconSort,
  IconSound,
} from '@arco-design/web-react/icon';
import { Slider } from 'antd';
import Image from 'next/image';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  DianaWeeklyAvailableProgramsInfo,
  hachimi_cover,
  jianwen_cover,
  sleep_cover,
  songs_cover,
} from '@/app/api/podcast/constants';
import { PODCAST_AUDIO_FETCH } from '@/app/lib/axios/constants';
import Request from '@/app/lib/axios/request';
import type { SongInfo } from '@/app/main/page';

const programCover = {
  songs: songs_cover,
  jianwen: jianwen_cover,
  sleep: sleep_cover,
  hachimi: hachimi_cover,
};

const PlayerControllerButton: React.FC<{
  children: ReactNode;
  action?: () => void;
}> = ({ children, action }) => {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: shut up
    // biome-ignore lint/a11y/noStaticElementInteractions: shut up
    // biome-ignore lint/a11y/useKeyWithClickEvents: shut up biome
    <div
      className="cursor-pointer rounded-2xl px-1 pt-1 pb-1 text-lg duration-400 hover:bg-[#e799b0]/60 md:px-2"
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

const IconFont = Icon.addFromIconFontCn({
  src: '//at.alicdn.com/t/c/font_5032848_tipbvltx1ls.js',
});

const Player: React.FC<{
  notification: NotificationHookReturnType;
  songInfo: SongInfo | undefined;
  togglePlaylist: () => void;
}> = ({ songInfo, togglePlaylist, notification }) => {
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
  const fetchProgramURL = useCallback(async () => {
    if (songInfo?.id) {
      setPaused('loading');
      const data = await Request.get(`${PODCAST_AUDIO_FETCH}/${songInfo?.id}`);
      if (player.current) {
        player.current.src = data.data.data.url;
      }
      await play();
      setupMediaSessionMetadata();
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
    } else {
      pause();
    }
    setPaused(!paused);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: ？
  useEffect(() => {
    fetchProgramURL();
  }, [songInfo]);

  useEffect(() => {
    if (player.current) {
      player.current.onended = (_) => pause();
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

  const setupMediaSessionMetadata = useCallback(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songInfo?.name,
        artist: 'Diana Radio',
        album: DianaWeeklyAvailableProgramsInfo.find(
          (v) => v.key === songInfo?.type
        )?.name,
        artwork: [
          {
            src: programCover[songInfo?.type ?? 'songs'].src,
            sizes: '512x512',
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
    }, 10);
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
    }, 10);
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
          <div
            className="overflow-clip rounded-[50%] shadow-black shadow-xl/10"
            onClick={async () => {
              await togglePlayPause();
            }}
          >
            <Image
              alt="cover"
              className={`w-40 animate-[spin_3s_linear_infinite] ${paused && 'pause-animation'} md:w-50`}
              src={programCover[songInfo?.type ?? 'songs']}
            />
          </div>

          <div className="flex flex-col items-center gap-y-2 px-8 text-center">
            <span className="font-bold text-black/85 text-xl md:text-2xl">
              {songInfo?.name ?? 'Diana Radio'}
            </span>
            <span className="font-normal text-black/85 text-sm md:text-lg">
              {songInfo?.type
                ? DianaWeeklyAvailableProgramsInfo.find(
                    (v) => v.key === songInfo?.type
                  )?.name
                : '未选择'}
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
          className={
            'flex h-full flex-col items-end justify-center bg-[#e799b0]'
          }
          style={{
            width: `${isDragging ? dragProgress * 100 : Number.isNaN(currentTime / duration) ? 0 : (currentTime / duration) * 100}%`,
          }}
        >
          <IconFont
            className={'-right-2 absolute z-[99] cursor-pointer text-2xl'}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              left: `calc(${isDragging ? dragProgress * 100 : Number.isNaN(currentTime / duration) ? 0 : (currentTime / duration) * 100}% - 12px)`,
            }}
            type="icon-yuandian"
          />
        </div>
      </div>
      <div className="flex h-16 w-full items-center justify-center bg-white/60 backdrop-blur-lg">
        {/** biome-ignore lint/a11y/useMediaCaption: 不需要 */}
        <audio ref={player} />
        <div className="flex gap-x-1/3 md:gap-x-4">
          <PlayerControllerButton
            action={() => {
              notification.info?.({
                title: 'TODO',
                content: <span>🚧施工中🚧</span>,
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
              notification.info?.({
                title: 'TODO',
                content: <span>🚧施工中🚧</span>,
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
              // 这玩意关闭的时候会拉一坨 `<div style="width: 100%; position: absolute; top: 0px; left: 0px;"></div>` 到body
              // 离谱
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
                  {/* 字节没给滑动输入条这玩意加触摸屏适配 */}
                  {/* 懒得喷.jpg */}
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

export default Player;
export { programCover };

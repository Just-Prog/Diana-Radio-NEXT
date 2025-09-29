'use client';
import { Icon } from '@arco-design/web-react';
import {
  IconBackward,
  IconForward,
  IconLoading,
  IconMenuFold,
  IconPause,
  IconPlayArrow,
  IconSkipNext,
  IconSkipPrevious,
  IconSound,
} from '@arco-design/web-react/icon';
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
      className="cursor-pointer rounded-2xl px-1 pt-2 pb-1 text-lg duration-400 hover:bg-[#e799b0]/40 md:px-4"
      onClick={action}
    >
      <div className="opacity-45">{children}</div>
    </div>
  );
};

const IconFont = Icon.addFromIconFontCn({
  src: '//at.alicdn.com/t/c/font_5032848_tipbvltx1ls.js',
});

const Player: React.FC<{
  songInfo: SongInfo | undefined;
  togglePlaylist: () => void;
}> = ({ songInfo, togglePlaylist }) => {
  const player = useRef<HTMLAudioElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState<boolean | 'loading'>(true);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

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
      console.trace();
      player.current.currentTime = v;
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
  }, []);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = paused ? 'paused' : 'playing';
    }
  }, [paused]);

  const onClickProgressBar = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: shutup
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <div className="flex h-full select-none flex-col items-center justify-center gap-y-8">
          <div className="overflow-clip rounded-[50%] shadow-black shadow-xl/10">
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
            width: `${isDragging ? dragProgress * 100 : (currentTime / duration) * 100}%`,
          }}
        >
          <IconFont
            className={'-right-2 absolute z-[99] cursor-pointer text-2xl'}
            onMouseDown={handleMouseDown}
            style={{
              left: `calc(${isDragging ? dragProgress * 100 : (currentTime / duration) * 100}% - 12px)`,
            }}
            type="icon-yuandian"
          />
        </div>
      </div>
      <div className="flex h-16 w-full items-center justify-center bg-white/60 backdrop-blur-lg">
        {/** biome-ignore lint/a11y/useMediaCaption: 不需要 */}
        <audio ref={player} />
        <div className="flex gap-x-4">
          <PlayerControllerButton>
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
          <PlayerControllerButton>
            <IconSkipNext />
          </PlayerControllerButton>
          <PlayerControllerButton>
            <IconSound />
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

'use client';
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
import { DianaWeeklyAvailableProgramsInfo } from '@/app/api/podcast/constants';
import jianwen_cover from '@/app/assets/program/jianwen.png';
import sleep_cover from '@/app/assets/program/sleep.png';
import songs_cover from '@/app/assets/program/songs.png';
import { PODCAST_AUDIO_FETCH } from '@/app/lib/axios/constants';
import Request from '@/app/lib/axios/request';
import type { SongInfo } from '@/app/main/page';

const programCover = {
  songs: songs_cover,
  jianwen: jianwen_cover,
  sleep: sleep_cover,
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
      className="cursor-pointer rounded-2xl px-1 pt-2 pb-1 duration-400 hover:bg-gray-400/20 md:px-4"
      onClick={action}
    >
      {children}
    </div>
  );
};

const Player: React.FC<{
  songInfo: SongInfo | undefined;
  togglePlaylist: () => void;
}> = ({ songInfo, togglePlaylist }) => {
  const player = useRef<HTMLAudioElement>(null);
  const [paused, setPaused] = useState<boolean | 'loading'>(true);

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
    console.dir(player.current);
  }, [player.current]);

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
      <div className="flex h-16 w-full items-center justify-center bg-white/60 backdrop-blur-lg">
        {/** biome-ignore lint/a11y/useMediaCaption: 不需要 */}
        <audio ref={player} />
        <div className="flex gap-x-4">
          <PlayerControllerButton>
            <IconSkipPrevious className="text-lg text-white" />
          </PlayerControllerButton>
          <PlayerControllerButton>
            <IconBackward className="text-lg text-white" />
          </PlayerControllerButton>
          <PlayerControllerButton action={togglePlayPause}>
            {paused === 'loading' ? (
              <IconLoading className="text-lg text-white" />
            ) : paused ? (
              <IconPlayArrow className="text-lg text-white" />
            ) : (
              <IconPause className="text-lg text-white" />
            )}
          </PlayerControllerButton>
          <PlayerControllerButton>
            <IconForward className="text-lg text-white" />
          </PlayerControllerButton>
          <PlayerControllerButton>
            <IconSkipNext className="text-lg text-white" />
          </PlayerControllerButton>
          <PlayerControllerButton>
            <IconSound className="text-lg text-white" />
          </PlayerControllerButton>
          <PlayerControllerButton action={togglePlaylist}>
            <IconMenuFold className="text-lg text-white" />
          </PlayerControllerButton>
        </div>
      </div>
    </div>
  );
};

export default Player;
export { programCover };

'use client';
import {
  IconBackward,
  IconForward,
  IconMenuFold,
  IconPlayArrow,
  IconSkipNext,
  IconSkipPrevious,
  IconSound,
} from '@arco-design/web-react/icon';
import Image from 'next/image';
import { type ReactNode, useEffect, useRef, useState } from 'react';
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
    // biome-ignore lint/a11y/useKeyWithClickEvents: sb biome
    <div
      className="cursor-pointer rounded-2xl px-1 pt-2 pb-1 duration-400 hover:bg-gray-400/20 md:px-4"
      onClick={action}
    >
      {children}
    </div>
  );
};

const Player: React.FC<{
  type: 'songs' | 'sleep' | 'jianwen';
  songInfo: SongInfo | undefined;
  togglePlaylist: () => void;
}> = ({ type, songInfo, togglePlaylist }) => {
  const player = useRef(null);
  const playerURL = useState('');
  const fetchProgramURL = async () => {
    if (songInfo?.id) {
      const data = await Request.get(`${PODCAST_AUDIO_FETCH}/${songInfo?.id}`);
      console.log(data.data);
    } else {
      return;
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: ?真加了你又不乐意
  useEffect(() => {
    fetchProgramURL();
  }, [songInfo]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <div className="flex h-full select-none flex-col items-center justify-center gap-y-8">
          <div className="overflow-clip rounded-[50%] shadow-black shadow-xl/10">
            <Image
              alt="cover"
              className={'w-40 animate-[spin_3s_linear_infinite] md:w-50'}
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
        <audio preload="metadata" ref={player} src={undefined} />
        <div className="flex gap-x-4">
          <PlayerControllerButton>
            <IconSkipPrevious className="text-lg text-white" />
          </PlayerControllerButton>
          <PlayerControllerButton>
            <IconBackward className="text-lg text-white" />
          </PlayerControllerButton>
          <PlayerControllerButton>
            <IconPlayArrow className="text-lg text-white" />
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

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
import type { ReactNode } from 'react';
import jianwen_cover from '@/app/assets/program/jianwen.png';
import songs_cover from '@/app/assets/program/songs.png';
import sleep_cover from '@/app/assets/program/songs.png';
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
  songInfo: SongInfo;
  togglePlaylist: () => void;
}> = ({ type, songInfo, togglePlaylist }) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <div className="flex h-full select-none flex-col items-center justify-center gap-y-8">
          <div className="overflow-clip rounded-[50%] shadow-black shadow-xl/10">
            <Image
              alt="cover"
              className={'w-40 animate-[spin_3s_linear_infinite] md:w-50'}
              src={programCover[type]}
            />
          </div>

          <span className="font-bold text-black/85 text-xl md:text-2xl">
            SongName
          </span>
        </div>
      </div>
      <div className="flex h-16 w-full items-center justify-center bg-white/60 backdrop-blur-lg">
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

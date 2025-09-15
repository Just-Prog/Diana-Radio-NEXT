'use client';
import { Button } from '@arco-design/web-react';
import {
  IconBackward,
  IconForward,
  IconPlayArrow,
  IconSkipNext,
  IconSkipPrevious,
  IconSound,
} from '@arco-design/web-react/icon';
import Image from 'next/image';
import jianwen_cover from '@/app/assets/program/jianwen.png';
import songs_cover from '@/app/assets/program/songs.png';
import sleep_cover from '@/app/assets/program/songs.png';

const programCover = {
  songs: songs_cover,
  jianwen: jianwen_cover,
  sleep: sleep_cover,
};

const PlayerControllerButton = ({ children }) => {
  return (
    <span className="cursor-pointer rounded-2xl px-4 pt-2 pb-1 hover:bg-gray-400/20">
      {children}
    </span>
  );
};

const Player: React.FC<{
  type: 'songs' | 'sleep' | 'jianwen';
  songInfo: any;
}> = ({ type, songInfo }) => {
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
        </div>
      </div>
    </div>
  );
};

export default Player;

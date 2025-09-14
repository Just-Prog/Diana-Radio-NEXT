import Image from 'next/image';

import jianwen_cover from '@/app/assets/program/jianwen.png';
import songs_cover from '@/app/assets/program/songs.png';
import sleep_cover from '@/app/assets/program/songs.png';

const programCover = {
  songs: songs_cover,
  jianwen: jianwen_cover,
  sleep: sleep_cover,
};

const Player: React.FC<{
  type: 'songs' | 'sleep' | 'jianwen';
  songInfo: any;
}> = ({ type, songInfo }) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <div className="flex h-full select-none flex-col items-center justify-center gap-y-8">
          <Image
            alt="cover"
            className={
              'w-40 animate-[spin_3s_linear_infinite] rounded-[50%] shadow-black shadow-xl/10 md:w-50'
            }
            src={programCover[type]}
          />
          <span className="font-bold text-black/85 text-xl md:text-2xl">
            SongName
          </span>
        </div>
      </div>
      <div className="flex h-16 w-full items-center justify-center bg-white/60 backdrop-blur-lg">
        ControllerBar
      </div>
    </div>
  );
};

export default Player;

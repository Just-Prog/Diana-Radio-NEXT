'use client';
import { useEffect, useState } from 'react';
import IconFont from '../../../common/iconfont';

type lyricsResp = { time: number; text: string };

const LyricSwitch: React.FC<{
  isLyricAreaEnabled: boolean;
}> = ({ isLyricAreaEnabled }) => (
    <div className="relative h-4 w-4">
      <IconFont
        className="!fill-black !text-black !stroke-black"
        size={18}
        type="icon-c-icon-gecix"
      />
      {!isLyricAreaEnabled && (
        <IconFont
          className="-right-1 -bottom-1 !stroke-black !stroke-2 absolute z-10"
          size={12}
          type="icon-icon-close"
        />
      )}
    </div>
  );

const LyricDisplayArea: React.FC<{
  lyrics: lyricsResp[];
  current: number;
}> = ({ lyrics, current }) => {
  const [lyricCurrent, setLyricCurrent] = useState<number>(0);

  useEffect(() => {
    setLyricCurrent(
      lyrics.length > 0
        ? (() => {
            const temp = lyrics.findIndex((v) => v.time >= current);
            return temp !== -1 ? temp : lyrics.length - 1;
          })()
        : 0
    );
  }, [current]);

  return (
    <div className="flex h-4 w-[85%] items-center justify-center overflow-hidden rounded-lg bg-white/30 p-6 md:w-[40%]">
      <p className="absolute">{lyrics[lyricCurrent]?.text ?? ''}</p>
    </div>
  );
};

export { LyricSwitch, LyricDisplayArea };

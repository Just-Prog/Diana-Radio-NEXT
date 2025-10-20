'use client';
import IconFont from '../common/iconfont';

type lyricsResp = { time: number; text: string };

const LyricSwitch: React.FC<{
  isLyricAreaEnabled: boolean;
}> = ({ isLyricAreaEnabled }) => {
  return (
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
};

const LyricDisplayArea = (lyrics: lyricsResp) => {
  return (
    <div className="flex h-16 items-center justify-center">
      Lyrics Display Area
    </div>
  );
};

export { LyricSwitch, LyricDisplayArea };

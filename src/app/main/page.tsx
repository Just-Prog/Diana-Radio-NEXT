'use client';
import { Drawer } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import Player from '../ui/player/player';
import Playlist from '../ui/player/playlist';

const getWindowSize = () => ({
  innerHeight: window.innerHeight,
  innerWidth: window.innerWidth,
});

type SongInfo = {
  id: string;
  name: string;
  type?: 'songs' | 'sleep' | 'jianwen';
};

export default function MainPage() {
  const [currentPlaying, setCurrentPlaying] = useState<SongInfo>({});
  const [playlistOpened, setPlaylistOpened] = useState<boolean>(false);

  const [windowSize, setWindowSize] = useState(getWindowSize());

  const handleResize = () => {
    setWindowSize(getWindowSize());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: ?
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div
        className="flex h-full max-w-full flex-1 flex-col overflow-y-auto overflow-x-hidden md:flex-row"
        id="player_card"
      >
        <div className="h-full bg-linear-120 from-pink-400 to-orange-300 backdrop-blur-lg md:flex-3">
          <div className="flex h-full max-h-full w-full max-w-full">
            <Player
              songInfo={currentPlaying}
              togglePlaylist={() => setPlaylistOpened(true)}
              type={currentPlaying.type ?? 'songs'}
            />
          </div>
        </div>
      </div>
      <Drawer
        className="w-20 md:w-80"
        footer={null}
        getPopupContainer={() => {
          return document.querySelector('#player_card') ?? document.body;
        }}
        onCancel={() => setPlaylistOpened(false)}
        unmountOnExit
        visible={playlistOpened}
        width={windowSize.innerWidth <= 768 ? '100%' : '50%'}
      >
        <div className="h-full md:flex-2">
          <Playlist
            currentPlaying={currentPlaying}
            setCurrentPlaying={setCurrentPlaying}
          />
        </div>
      </Drawer>
    </>
  );
}

export type { SongInfo };

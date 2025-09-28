'use client';
import { Drawer } from '@arco-design/web-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import useWindowSize from '../lib/hooks/useWindowSize';
import Player, { programCover } from '../ui/player/player';
import Playlist from '../ui/player/playlist';

type SongInfo = {
  id: string;
  name: string;
  type?: 'songs' | 'sleep' | 'jianwen' | 'hachimi';
};

export default function MainPage() {
  const [currentPlaying, setCurrentPlaying] = useState<SongInfo>();
  const [playlistOpened, setPlaylistOpened] = useState<boolean>(false);

  const windowSize = useWindowSize();

  return (
    <>
      <div
        className="flex h-full max-w-full flex-1 flex-col overflow-y-auto overflow-x-hidden md:flex-row"
        id="player_card"
      >
        {/* <div className="h-full bg-linear-120 from-pink-400 to-orange-300 backdrop-blur-lg md:flex-3"> */}
        <div className="h-full backdrop-blur-lg md:flex-3">
          <div className="-z-10 absolute h-full w-full flex-1 overflow-clip bg-[#e799b0] blur-lg">
            <div
              className="flex h-full min-h-full w-full min-w-full flex-1"
              style={{
                backgroundImage: `url(${programCover[currentPlaying?.type ?? 'songs'].src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
          <div className="flex h-full max-h-full w-full max-w-full">
            <Player
              songInfo={currentPlaying}
              togglePlaylist={() => setPlaylistOpened(true)}
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
        width={windowSize?.width && window.innerWidth <= 768 ? '100%' : '50%'}
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

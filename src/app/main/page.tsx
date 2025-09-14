'use client';
import { useEffect, useState } from 'react';
import { PODCAST_LIST_FETCH } from '../lib/axios/constants';
import Request from '../lib/axios/request';
import Player from '../ui/player/player';
import Playlist from '../ui/player/playlist';
export default function MainPage() {
  const [playlist, setPlaylist] = useState<[]>();
  const [playlistType, setPlaylistType] = useState<
    'songs' | 'sleep' | 'jianwen'
  >('songs');
  const [currentPlaying, setCurrentPlaying] = useState<any>({});
  const fetchPlaylist = async () => {
    const data = await Request.get(`${PODCAST_LIST_FETCH}/${playlistType}`);
    setPlaylist(data.data);
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: why?
  useEffect(() => {
    fetchPlaylist();
  }, [playlistType]);

  return (
    <div className="flex h-full max-w-full flex-1 flex-col overflow-y-auto overflow-x-hidden md:flex-row">
      <div className="h-full flex-2 bg-linear-120 from-pink-400 to-orange-300 backdrop-blur-lg md:flex-3">
        <div className="flex h-full max-h-full w-full max-w-full flex-1 items-center justify-center">
          <Player
            songInfo={currentPlaying}
            type={currentPlaying.type ?? 'songs'}
          />
        </div>
      </div>
      <div className="h-full flex-1 md:flex-2">
        <Playlist currentPlaying={currentPlaying} data={playlist} />
      </div>
    </div>
  );
}

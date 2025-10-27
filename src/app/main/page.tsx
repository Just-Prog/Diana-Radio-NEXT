'use client';
import { Modal, Notification, Switch } from '@arco-design/web-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getPlaylistManager } from '@/app/lib/utils/ncmPlaylistManager';
import IconFont from '../ui/common/iconfont';
import LiveIndicator from '../ui/main/live_indicator';
import PlaylistBilibili from '../ui/player/bilibili_list';
import Player, { programCover } from '../ui/player/player';
import Playlist from '../ui/player/playlist';

type SongInfo = {
  date: string;
  id: string;
  pid: number;
  name: string;
  type?: 'songs' | 'sleep' | 'jianwen' | 'hachimi';
  playTime: number;
};

export default function MainPage() {
  const [notification, contextHolder] = Notification.useNotification({
    maxCount: 1,
  });
  const [isClient, setIsClient] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState<SongInfo>();
  const [playlistOpened, setPlaylistOpened] = useState<boolean>(false);

  const [isBilibiliMode, setIsBilibiliMode] = useState(false);

  const playlistManager = getPlaylistManager();

  // 处理播放器事件
  useEffect(() => {
    setIsClient(true);

    const handleSongChanged = (event: CustomEvent) => {
      setCurrentPlaying(event.detail);
    };

    const handleSongEnded = (event: CustomEvent) => {
      setCurrentPlaying(event.detail);
    };

    window.addEventListener('songChanged', handleSongChanged as EventListener);
    window.addEventListener('songEnded', handleSongEnded as EventListener);

    return () => {
      window.removeEventListener(
        'songChanged',
        handleSongChanged as EventListener
      );
      window.removeEventListener('songEnded', handleSongEnded as EventListener);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'player_platform',
      isBilibiliMode ? 'bilibili' : 'ncm_podcast'
    );
  }, [isBilibiliMode]);

  // 初始化时恢复播放和平台模式状态
  useEffect(() => {
    setIsBilibiliMode(localStorage.getItem('player_platform') !== 'bilibili');
    const restoredSong = playlistManager.getCurrentSong();
    if (restoredSong) {
      setCurrentPlaying(restoredSong);
    }
  }, []);

  return (
    <>
      {contextHolder}
      <div
        className="flex h-full max-w-full flex-1 flex-col overflow-y-auto overflow-x-hidden md:flex-row"
        id="player_card"
      >
        {/* <div className="h-full bg-linear-120 from-pink-400 to-orange-300 backdrop-blur-lg md:flex-3"> */}
        <div className="h-full backdrop-blur-lg md:flex-3">
          <LiveIndicator />
          <div className="absolute top-4 right-4 flex flex-row justify-end gap-x-2">
            <span className="flex flex-row items-center gap-x-2 text-sm">
              <p className="text-sm">
                模式：{isBilibiliMode ? 'Bilibili' : '播客'}
              </p>
              <Switch
                checked={isBilibiliMode}
                onChange={(v) => setIsBilibiliMode(v)}
              />
            </span>
            {isClient && (
              <div
                className="cursor-pointer"
                onClick={() => {
                  if (
                    navigator?.serviceWorker &&
                    navigator?.serviceWorker?.controller
                  ) {
                    navigator?.serviceWorker?.controller.postMessage({
                      action: 'CACHE_CLEAR',
                    });
                    notification.info?.({
                      title: '清理缓存',
                      content: <span>已尝试清理。</span>,
                    });
                  }
                }}
              >
                <IconFont
                  className="!text-2xl z-[99] w-4 text-black"
                  type="icon-qinglihuancun"
                />
              </div>
            )}
          </div>

          <div className="-z-10 absolute h-full w-full flex-1 overflow-clip bg-[#e799b0] blur-lg">
            <div className="flex h-full min-h-full w-full min-w-full flex-1">
              <Image
                alt=""
                className={'h-full w-full object-cover object-center'}
                src={programCover[currentPlaying?.type ?? 'songs']}
              />
            </div>
          </div>
          <div className="flex h-full max-h-full w-full max-w-full">
            <Player
              notification={notification}
              songInfo={currentPlaying}
              togglePlaylist={() => setPlaylistOpened(true)}
            />
          </div>
        </div>
      </div>
      <Modal
        className="!w-[90%] md:!w-[60%] flex overflow-hidden"
        footer={null}
        onCancel={() => setPlaylistOpened(false)}
        visible={playlistOpened}
      >
        <div className="flex h-[calc(90vh-48px)] w-full flex-1 md:h-[80vh]">
          {isBilibiliMode ? (
            <PlaylistBilibili />
          ) : (
            <Playlist
              currentPlaying={currentPlaying}
              setCurrentPlaying={(v) => {
                setCurrentPlaying(v);
                setPlaylistOpened(false);
              }}
            />
          )}
        </div>
      </Modal>
    </>
  );
}

export type { SongInfo };

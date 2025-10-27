'use client';

import { List, Select } from '@arco-design/web-react';
import { IconMusic, IconPlayCircle } from '@arco-design/web-react/icon';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { DianaWeeklyAvailableProgramsInfo } from '@/app/api/podcast/constants';
import image_404 from '@/app/assets/404.png';
import { PODCAST_LIST_FETCH } from '@/app/lib/axios/constants';
import Request from '@/app/lib/axios/request';
import { getPlaylistManager } from '@/app/lib/utils/ncmPlaylistManager';
import { ts2mmss } from '@/app/lib/utils/timestamp';
import type { SongInfo } from '@/app/main/page';

const Option = Select.Option;
const options = DianaWeeklyAvailableProgramsInfo;

const Playlist: React.FC<{
  currentPlaying: SongInfo | undefined;
  setCurrentPlaying: (value: SongInfo) => void;
}> = ({ currentPlaying, setCurrentPlaying }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playlist, setPlaylist] = useState<SongInfo[]>();
  const FIRST_BROADCAST_TIMESTAMP = 1_607_772_600; // 2021-01-01 00:00:00 的时间戳
  const [updatedAt, setUpdatedAt] = useState<number>(FIRST_BROADCAST_TIMESTAMP);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [playlistType, setPlaylistType] = useState<
    'songs' | 'sleep' | 'jianwen' | 'hachimi'
  >('songs');

  const playlistManager = getPlaylistManager();

  const fetchPlaylist = async () => {
    setIsLoading(true);
    setPlaylist([]);

    const data = await Request.get(`${PODCAST_LIST_FETCH}${playlistType}`);
    const songs = data.data.programs.map((v: SongInfo) => {
      v.type = playlistType;
      return v;
    });

    setPlaylist(songs);
    setUpdatedAt(data.data.updated_at);
    setTotalCount(data.data.count);

    // 更新播放列表管理器和缓存
    playlistManager.setPlaylist(songs, playlistType);
    setIsLoading(false);
  };

  // const status = useState<'loading' | 'error' | 'done'>('loading');

  // biome-ignore lint/correctness/useExhaustiveDependencies: why?
  useEffect(() => {
    fetchPlaylist();
  }, [playlistType]);

  return (
    <div className="flex h-full max-h-full min-h-full w-full flex-1 flex-col gap-y-2 p-4">
      <span>已存档总数：{totalCount}</span>
      <span>最近更新: {new Date(updatedAt * 1000).toLocaleString()}</span>
      <span>加载时间过久可能是在全局刷新，还请耐心等待。</span>
      <Select
        className="w-full"
        defaultValue={playlistType}
        onChange={(v) => setPlaylistType(v)}
        placeholder="选择电台"
        renderFormat={(_, value) => {
          return (
            <span>
              {
                DianaWeeklyAvailableProgramsInfo.find((v) => v.key === value)
                  ?.name
              }
            </span>
          );
        }}
      >
        {options.map((option) => (
          <Option key={option.key} value={option.key}>
            <div className="flex flex-row items-center gap-x-4">
              <div className="my-2 overflow-clip rounded">
                <Image
                  alt="cover"
                  className="object-contain"
                  src={option.cover}
                  width={48}
                />
              </div>
              <span className="font-bold text-semibold">{option.name}</span>
            </div>
          </Option>
        ))}
      </Select>
      <div className="flex-1 overflow-y-auto overflow-x-clip">
        <List
          dataSource={playlist}
          loading={isLoading}
          noDataElement={
            <div className="my-4 flex flex-col items-center gap-y-4 text-center">
              <Image
                alt="empty"
                className="w-24 object-contain md:w-36"
                src={image_404}
              />
              <span>什么都没有</span>
            </div>
          }
          render={(v) => {
            return (
              <List.Item key={v.id}>
                <div className="flex w-full max-w-full flex-row items-center gap-x-4">
                  <IconMusic className="mr-2 text-lg" />
                  <div
                    className={`${currentPlaying?.id === v.id ? 'font-bold text-blue-500' : ''} mr-2 flex flex-1 flex-col`}
                  >
                    <span className="line-clamp-1 overflow-clip text-ellipsis text-sm">
                      {v.name}
                    </span>
                    <span className="text-gray-500 text-xs">
                      <span>{ts2mmss(v.playTime)}</span>
                      <span>
                        {v.date
                          ? ` - ${v.date.replaceAll('.', '/')}`
                          : ' - 未知日期'}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-row items-center">
                    <button
                      className="cursor-pointer rounded-2xl px-2 duration-400 hover:bg-gray-400/20"
                      onClick={() => {
                        playlistManager.playSong(v);
                        setCurrentPlaying(v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          playlistManager.playSong(v);
                          setCurrentPlaying(v);
                        }
                      }}
                      type="button"
                    >
                      <IconPlayCircle className="text-lg" />
                    </button>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default Playlist;

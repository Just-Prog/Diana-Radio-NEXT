'use client';

import { Empty, List, Message, Select } from '@arco-design/web-react';
import { IconMusic, IconPlayCircle } from '@arco-design/web-react/icon';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DianaWeeklyAvailableProgramsInfo } from '@/app/api/podcast/constants';
import image_404 from '@/app/assets/404.png';
import { PODCAST_LIST_FETCH } from '@/app/lib/axios/constants';
import Request from '@/app/lib/axios/request';
import type { SongInfo } from '@/app/main/page';

const Option = Select.Option;
const options = DianaWeeklyAvailableProgramsInfo;

const Playlist: React.FC<{
  currentPlaying: SongInfo | undefined;
  setCurrentPlaying: (value: SongInfo) => void;
}> = ({ currentPlaying, setCurrentPlaying }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playlist, setPlaylist] = useState<SongInfo[]>();
  // biome-ignore lint/style/noMagicNumbers: 首播时间
  const [updatedAt, setUpdatedAt] = useState<number>(1_607_772_600);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [playlistType, setPlaylistType] = useState<
    'songs' | 'sleep' | 'jianwen'
  >('songs');
  const fetchPlaylist = async () => {
    setIsLoading(true);
    setPlaylist([]);
    try {
      const data = await Request.get(`${PODCAST_LIST_FETCH}/${playlistType}`);
      setPlaylist(
        data.data.programs.map((v: SongInfo) => {
          v.type = playlistType;
          return v;
        })
      );
      setUpdatedAt(data.data.updated_at);
      setTotalCount(data.data.count);
    } finally {
      setIsLoading(false);
    }
  };

  const status = useState<'loading' | 'error' | 'done'>('loading');

  // biome-ignore lint/correctness/useExhaustiveDependencies: why?
  useEffect(() => {
    fetchPlaylist();
  }, [playlistType]);

  return (
    <div className="flex h-full max-h-full flex-col gap-y-2 p-4">
      <span>已存档总数：{totalCount}</span>
      <span>最近更新: {new Date(updatedAt * 1000).toLocaleString()}</span>
      <Select
        className="w-full"
        defaultValue={playlistType}
        onChange={(v) => setPlaylistType(v)}
        placeholder="选择电台"
      >
        {options.map((option) => (
          <Option key={option.key} value={option.key}>
            {option.name}
          </Option>
        ))}
      </Select>
      <div className="h-full flex-1 overflow-auto overflow-x-clip">
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
              <List.Item
                extra={
                  // biome-ignore lint/a11y/noNoninteractiveElementInteractions: shut up
                  // biome-ignore lint/a11y/noStaticElementInteractions: shut up
                  // biome-ignore lint/a11y/useKeyWithClickEvents: shut up
                  <div
                    className="cursor-pointer rounded-2xl px-2 duration-400 hover:bg-gray-400/20"
                    onClick={() => setCurrentPlaying(v)}
                  >
                    <IconPlayCircle className="text-sm" />
                  </div>
                }
                key={v.id}
              >
                <div className="line-clamp-1 w-full max-w-full gap-x-4 overflow-clip text-ellipsis">
                  <IconMusic />
                  <span>{v.name}</span>
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

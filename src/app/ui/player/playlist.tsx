'use client';

import { Message, Select } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { DianaWeeklyAvailableProgramsInfo } from '@/app/api/podcast/constants';
import { PODCAST_LIST_FETCH } from '@/app/lib/axios/constants';
import Request from '@/app/lib/axios/request';

const Option = Select.Option;
const options = DianaWeeklyAvailableProgramsInfo;

const Playlist: React.FC<{
  currentPlaying: any;
}> = ({ currentPlaying }) => {
  const [playlist, setPlaylist] = useState<[]>();
  // biome-ignore lint/style/noMagicNumbers: 首播时间
  const [updatedAt, setUpdatedAt] = useState<number>(1_607_772_600);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [playlistType, setPlaylistType] = useState<
    'songs' | 'sleep' | 'jianwen'
  >('songs');
  const fetchPlaylist = async () => {
    const data = await Request.get(`${PODCAST_LIST_FETCH}/${playlistType}`);
    setPlaylist(data.data.programs);
    setUpdatedAt(data.data.updated_at);
    setTotalCount(data.data.count);
  };

  const status = useState<'loading' | 'error' | 'done'>('loading');

  // biome-ignore lint/correctness/useExhaustiveDependencies: why?
  useEffect(() => {
    fetchPlaylist();
  }, [playlistType]);

  return (
    <div className="flex flex-col gap-y-2 p-4">
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
    </div>
  );
};

export default Playlist;

'use client';

import { Popover } from '@arco-design/web-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LIVE_STATUS_FETCH } from '@/app/lib/axios/constants';
import Request from '@/app/lib/axios/request';

type LiveRoomStatusProps = {
  uid: number;
  room_id: number;
  description: string;
  live_status: number;
  area_id: number;
  parent_area_id: number;
  title: string;
  user_cover: string;
  keyframe: string;
  live_time: string;
};

const LIVE_STATUS = ['未开播', '直播中', '轮播中', '加载中'];
const LIVE_STATUS_COLOR = ['#A9AEB8', '#F76560', '#FCF26B'];

const LiveIndicator = () => {
  const [info, setInfo] = useState<LiveRoomStatusProps>();

  const fetchInfo = async () => {
    const data: { data: LiveRoomStatusProps } =
      await Request.get(LIVE_STATUS_FETCH);
    setInfo(data.data);
  };

  useEffect(() => {
    fetchInfo().then((_) => {
      const interval = setInterval(() => {
        fetchInfo();
      }, 60_000);
      return () => {
        clearInterval(interval);
      };
    });
  }, []);

  return (
    <Popover
      content={
        <div className="flex flex-col gap-y-2 p-2">
          <span>
            {info?.live_status === 1 ? null : '近期'}直播:
            {info?.title ?? 'Unknown'}
          </span>
          <Image
            alt=""
            className="rounded object-contain"
            height={0}
            src={
              info?.live_status === 1
                ? info.keyframe
                : (info?.user_cover ??
                  'https://i0.hdslb.com/bfs/live/new_room_cover/d1270e7de42c52f60e8b3873ee23e40bb5005c92.jpg@200w.avif')
            }
            width={250}
          />
        </div>
      }
      position={'bl'}
    >
      <div className="absolute top-4 left-4 flex cursor-pointer flex-row items-center justify-center rounded-xl border border-[#e799b0] bg-white/80 p-2">
        <div
          className={'mr-2 h-3 w-3 rounded-[50%]'}
          style={{ backgroundColor: LIVE_STATUS_COLOR[info?.live_status ?? 0] }}
        />
        <span>{LIVE_STATUS[info?.live_status ?? 3]}</span>
      </div>
    </Popover>
  );
};

export default LiveIndicator;

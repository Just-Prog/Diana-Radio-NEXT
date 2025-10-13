import type { NextRequest } from 'next/server';
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

export async function GET(req: NextRequest) {
  try {
    const all = await Request.get(
      'https://api.live.bilibili.com/room/v1/Room/get_info',
      {
        params: {
          room_id: '22637261',
        },
      }
    );
    const data: LiveRoomStatusProps = all.data.data;
    return Response.json({
      code: 0,
      data,
    });
  } catch (e) {
    return Response.json(
      {
        code: 500,
        msg: 'unknown error',
      },
      { status: 500 }
    );
  }
}

export type { LiveRoomStatusProps };

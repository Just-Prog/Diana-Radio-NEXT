import type { NextRequest } from 'next/server';
import Request from '@/app/lib/axios/request';

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
    return Response.json({
      code: 0,
      data: all.data.data,
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

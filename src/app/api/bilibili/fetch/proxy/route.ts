import { AxiosError } from 'axios';
import { type NextRequest, NextResponse } from 'next/server';
import { BilibiliHeaders } from '@/app/api/podcast/constants';
import { decryption } from '@/app/lib/api/utils/cryptojs';
import Request from '@/app/lib/axios/request';

const pcdn_pattern =
  /(https:\/\/[^/]*.mcdn\.bilivideo\.cn|https?:\/\/[^/]*szbdyd\.com)(:\d+)?/g;

export async function POST(req: NextRequest) {
  let { target } = await req.json();
  target = decryption(target);
  const url = new URL(target);
  if (
    url.hostname.endsWith('bilivideo.cn') ||
    url.hostname.endsWith('bilivideo.com') ||
    url.hostname.endsWith('szbdyd.com')
  ) {
    try {
      target = target.replace(
        pcdn_pattern,
        'https://upos-sz-estghw.bilivideo.com'
      );
      // Fetch with streaming enabled
      const response = await Request.get(target, {
        headers: BilibiliHeaders,
        responseType: 'stream',
      });

      // Return streaming response with proper headers
      return new NextResponse(response.data, {
        status: 200,
        headers: {
          'content-type': 'audio/mp4',
          'cache-control': 'no-cache',
          'transfer-encoding': 'chunked',
        },
      });
    } catch (e: any) {
      if (e instanceof AxiosError) {
        return NextResponse.json(
          {
            code: e.status,
            msg: e.code,
          },
          { status: e.status }
        );
      }
      return NextResponse.json(
        {
          code: 500,
          msg: e.message || e,
        },
        {
          status: 500,
        }
      );
    }
  }
  return NextResponse.json(
    {
      code: 1,
      msg: 'this api is only proxy resource for bilibili video stream cdn.',
    },
    { status: 403 }
  );
}

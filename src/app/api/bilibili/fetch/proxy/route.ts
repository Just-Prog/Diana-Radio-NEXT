import { type NextRequest, NextResponse } from 'next/server';
import { BilibiliHeaders } from '@/app/api/podcast/constants';
import { decryption } from '@/app/lib/api/utils/cryptojs';

const pcdn_pattern =
  /(https:\/\/[^/]*.mcdn\.bilivideo\.cn|https?:\/\/[^/]*szbdyd\.com)(:\d+)?/g;

export async function POST(req: NextRequest) {
  let { target } = await req.json();
  target = decryption(target);
  const url = new URL(target);
  if (
    url.hostname.endsWith('bilivideo.cn') ||
    url.hostname.endsWith('bilivideo.com')
  ) {
    try {
      target = target.replace(
        pcdn_pattern,
        'https://upos-sz-mirrorcoso1.bilivideo.com'
      );
      const data = await fetch(target, {
        headers: BilibiliHeaders,
      });
      return new NextResponse(await data.arrayBuffer(), {
        status: 200,
        headers: {
          'content-type': 'audio/mp4',
        },
      });
    } catch (e: any) {
      return NextResponse.json({
        code: 500,
        msg: e,
      });
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

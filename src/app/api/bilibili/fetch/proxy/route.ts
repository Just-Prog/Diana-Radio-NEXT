import { type NextRequest, NextResponse } from 'next/server';
import { BilibiliHeaders } from '@/app/api/podcast/constants';
import { decryption } from '@/app/lib/api/utils/cryptojs';

export async function POST(req: NextRequest) {
  let { target } = await req.json();
  target = decryption(target);
  const data = await fetch(target, {
    headers: BilibiliHeaders,
  });
  return new NextResponse(await data.arrayBuffer(), {
    status: 200,
    headers: {
      'content-type': 'audio/mp4',
    },
  });
}

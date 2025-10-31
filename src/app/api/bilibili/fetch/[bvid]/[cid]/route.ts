import type { NextRequest } from 'next/server';
import { BilibiliHeaders } from '@/app/api/podcast/constants';
import WbiSigner from '@/app/lib/api/utils/wbi_sign';
import Request from '@/app/lib/axios/request';

const pcdn_pattern =
  /https:\/\/xy\d+x\d+x\d+x\d+xy\.mcdn\.bilivideo\.cn(:\d+)?/g;

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/bilibili/fetch/[bvid]/[cid]'>
) {
  const { bvid, cid } = await ctx.params;
  const target = 'https://api.bilibili.com/x/player/wbi/playurl';
  const params = await WbiSigner({
    bvid,
    cid: Number.parseInt(cid, 10),
    fnval: 16,
  });
  const request = await Request(target, {
    headers: BilibiliHeaders,
    params,
  });
  const audio = request.data.data.dash.audio.reduce((acc: any, cur: any) => {
    if (cur.bandwidth === Math.max(acc.bandwidth, cur.bandwidth)) {
      return cur;
    }
    return cur;
  });
  let { base_url, backup_url, bandwidth, mime_type, codecs } = audio;
  base_url = base_url.replace(
    pcdn_pattern,
    'https://upos-sz-mirrorcos.bilivideo.com'
  );
  return Response.json({
    code: 0,
    data: {
      base_url,
      backup_url,
      bandwidth,
      mime_type,
      codecs,
      referer: `https://www.bilibili.com/${bvid}`,
    },
  });
}

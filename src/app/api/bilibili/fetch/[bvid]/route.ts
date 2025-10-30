import type { NextRequest } from 'next/server';
import { BilibiliHeaders } from '@/app/api/podcast/constants';
import WbiSigner from '@/app/lib/api/utils/wbi_sign';
import Request from '@/app/lib/axios/request';

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/bilibili/fetch/[bvid]'>
) {
  const { bvid } = await ctx.params;
  const target_v = 'https://api.bilibili.com/x/player/pagelist';
  const params_v = await WbiSigner({
    bvid,
  });
  const request_v = await Request.get(target_v, {
    params: params_v,
    headers: BilibiliHeaders,
  });
  if (request_v.data.code !== 0) {
    return Response.json({
      code: request_v.data.code,
      msg: request_v.data.message,
    });
  }
  return Response.json({
    code: 0,
    data: request_v.data.data,
  });
}

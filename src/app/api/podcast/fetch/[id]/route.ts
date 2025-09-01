import { song_url } from 'NeteaseCloudMusicApi';
import type { NextRequest } from 'next/server';
import { createClient } from 'redis';

const redis = await createClient({ url: process.env.REDIS_URL }).connect();

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/podcast/fetch/[id]'>
) {
  const { id } = await ctx.params;
  const res = await song_url({ id });
  return Response.json(res.body);
}

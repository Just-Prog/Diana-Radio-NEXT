/** biome-ignore-all lint/style/noMagicNumbers: shut up biome */
import { dj_program } from 'NeteaseCloudMusicApi';
import type { NextRequest } from 'next/server';

import redis from '@/app/lib/redis';
import { DianaWeeklyAvailablePodcasts } from '../../constants';

type listResponse = {
  code: number;
  count: number;
  programs: any;
};

const syncDB = async (data: any, prefix: string) => {
  const count = String(data.count);
  const updatedAt = String(Number.parseInt(String(Date.now() / 1000), 10));
  const programs = data.programs.map((e: any) => ({
    id: e.mainSong.id,
    name: e.mainSong.name,
  }));
  await redis.set(`${prefix}_count`, count);
  await redis.set(`${prefix}_updated_at`, updatedAt);
  await redis.set(`${prefix}_programs`, JSON.stringify(programs));
  return {
    count,
    updated_at: updatedAt,
    programs,
  };
};

const refreshAll = async () => {
  for (const [key, rid] of Object.entries(DianaWeeklyAvailablePodcasts)) {
    const limit = 2000; // 一次暴力拉下来2000个
    const result = await dj_program({
      rid,
      limit,
      offset: 0,
      asc: 'false',
    });
    const response = result.body as unknown as listResponse;
    if (response.code === 405) {
      return Response.json(
        {
          code: 405,
          message: 'request blocked by ncm risk firewall',
        },
        { status: 405 }
      );
    }
    await syncDB(response, key);
  }
  return;
};

const fetchFromDB = async (type: string) => {
  // console.log(`⭐Hit Cache (target: ${type})`);
  const count = await redis.get(`${type}_count`);
  const updated_at = await redis.get(`${type}_updated_at`);
  const programs = JSON.parse((await redis.get(`${type}_programs`)) ?? '{}');
  return {
    count,
    updated_at,
    programs,
  };
};

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/podcast/list/[type]'>
) {
  const { type } = await ctx.params;

  const isValidType = (
    key: string
  ): key is keyof typeof DianaWeeklyAvailablePodcasts => {
    return key in DianaWeeklyAvailablePodcasts;
  };

  if (isValidType(type)) {
    const isUpdated = (await redis.get(`${type}_updated_at`)) ?? 0;
    if (
      isUpdated &&
      Number.parseInt(String(Date.now() / 1000), 10) - Number(isUpdated) <
        86_400
    ) {
      return Response.json(await fetchFromDB(type));
    }

    await refreshAll();
    return Response.json(await fetchFromDB(type));
  }

  return Response.json({
    code: 501,
    message: 'program list restricted by whitelist',
  });
}

export { refreshAll };

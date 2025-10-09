import { dj_program } from 'NeteaseCloudMusicApi';
import { DianaWeeklyAvailablePodcasts } from '@/app/api/podcast/constants';
import redis from '../redis';

type listResponse = {
  code: number;
  count: number;
  programs: any;
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

const syncDB = async (data: any, prefix: string) => {
  const count = String(data.count);
  const updatedAt = String(Number.parseInt(String(Date.now() / 1000), 10));
  const programs = data.programs.map((e: any) => ({
    id: e.mainSong.id,
    name: e.mainSong.name,
    playTime:
      e.mainSong?.bMusic?.playTime ??
      e.mainSong?.hMusic?.playTime ??
      e.mainSong?.lMusic?.playTime ??
      0,
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

export { refreshAll, syncDB };

import { song_url } from 'NeteaseCloudMusicApi';
import type { NextRequest } from 'next/server';
import { DianaWeeklyAvailablePodcasts } from '@/app/api/podcast/constants';
import { refreshAll } from '@/app/lib/api/podcast';
import redis from '@/app/lib/redis';

interface songInfoResp {
  br: number;
  code: number;
  md5: string;
  type: string;
  url: string;
}

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/podcast/fetch/[id]'>
) {
  const { id } = await ctx.params;

  // Check if the ID exists in any of the programs lists
  const programTypes = Object.keys(DianaWeeklyAvailablePodcasts);

  const programInited = await redis.get(`${programTypes[0]}_updated_at`);

  if (!programInited) {
    await refreshAll();
  }

  for (const type of programTypes) {
    const programsData = await redis.get(`${type}_programs`);
    if (programsData) {
      const programs = JSON.parse(programsData);
      if (programs.some((program: any) => String(program.id) === String(id))) {
        const res: songInfoResp[] = (await song_url({ id })).body
          .data as songInfoResp[];
        const data = res[0];
        return Response.json({
          code: data.code,
          data: {
            br: data.br,
            md5: data.md5,
            type: data.type,
            url: data.url,
          },
        });
      }
    }
  }
  return Response.json(
    { code: 403, message: 'audio id not in whitelist' },
    { status: 403 }
  );
}

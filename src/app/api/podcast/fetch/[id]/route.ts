import { song_url } from 'NeteaseCloudMusicApi';
import type { NextRequest } from 'next/server';
import { DianaWeeklyAvailablePodcasts } from '@/app/api/podcast/constants';
import redis from '@/app/lib/redis';

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/podcast/fetch/[id]'>
) {
  const { id } = await ctx.params;

  // Check if the ID exists in any of the programs lists
  const programTypes = Object.keys(DianaWeeklyAvailablePodcasts);
  let isValidProgram = false;

  for (const type of programTypes) {
    const programsData = await redis.get(`${type}_programs`);
    if (programsData) {
      const programs = JSON.parse(programsData);
      if (programs.some((program: any) => String(program.id) === String(id))) {
        isValidProgram = true;
        break;
      }
    }
  }

  if (!isValidProgram) {
    return Response.json(
      { code: 403, message: 'audio id not in whitelist' },
      { status: 403 }
    );
  }

  const res = await song_url({ id });
  return Response.json(res.body);
}

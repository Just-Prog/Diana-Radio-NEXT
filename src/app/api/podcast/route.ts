import { dj_program } from 'NeteaseCloudMusicApi';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const result = await dj_program({
    rid: 986_394_922,
    limit: 30,
    offset: 0,
    asc: 'false',
  });
  return Response.json(result.body);
}

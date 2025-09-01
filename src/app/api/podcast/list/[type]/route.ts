import { dj_program } from 'NeteaseCloudMusicApi';
import type { NextRequest } from 'next/server';

const PC_SONGS = '986394922'; // A-SOUL嘉然歌曲合集
const PC_SLEEPSTORY = '992840254'; // 嘉然睡前故事合集
const PC_JIANWENLU = '1220070148'; // 小然见闻录

const DianaWeeklyAvailablePodcasts = {
  'jianwen': PC_JIANWENLU,
  'sleep': PC_SLEEPSTORY,
  'songs': PC_SONGS,
};

export async function GET(request: NextRequest, ctx: RouteContext<'/api/podcast/list/[type]'>) {
  const { type } = await ctx.params;
  
  const isValidType = (key: string): key is keyof typeof DianaWeeklyAvailablePodcasts => {
    return key in DianaWeeklyAvailablePodcasts;
  };
  
  if (isValidType(type)) {
    const result = await dj_program({
      rid: DianaWeeklyAvailablePodcasts[type],
      limit: 30,
      offset: 0,
      asc: 'false',
    });
    return Response.json(result.body);
  }
  
  return Response.json({
    code: 501,
    message: `program list restricted by whitelist`,
  });
}

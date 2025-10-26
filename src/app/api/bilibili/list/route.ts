import type { NextRequest } from 'next/server';
import WbiSigner from '@/app/lib/api/utils/wbi_sign';
import Request from '@/app/lib/axios/request';
import { BilibiliHeaders } from '../../podcast/constants';

const BLACKLIST_MID = [
  '1643484295', // @岱川Doris
];

export async function GET(
  req: NextRequest,
  context: RouteContext<'/api/bilibili/list'>
) {
  try {
    const pageNum = req.nextUrl.searchParams.get('page') ?? 1;
    const target = 'https://api.bilibili.com/x/web-interface/wbi/search/type';
    const params = await WbiSigner({
      search_type: 'video',
      page: pageNum,
      tids: 3,
      device: 'win',
      mobi_app: 'pc_electron',
      keyword: '嘉然',
      web_location: 'bilibili-electron',
      highlight: 0,
    });
    const data = (
      await Request.get(target, { params, headers: BilibiliHeaders })
    ).data.data.result
      .filter((v: any) => !BLACKLIST_MID.includes(v.mid))
      .map((v: any) => {
        const tmp = v;
        v.title = v.title
          .replace(/<em[^>]*>/gi, '')
          .replace(/<\/em>/gi, '')
          .replace(/<\\\/em>/gi, '')
          .replace(/&amp;/g, '&');
        return tmp;
      });
    return Response.json({
      code: 200,
      data,
    });
  } catch (e) {
    if (e instanceof Error) {
      return Response.json(
        {
          code: 500,
          msg: e.message,
        },
        {
          status: 500,
        }
      );
    }
  }
  return Response.json(
    {
      code: 500,
      msg: 'unknown',
    },
    {
      status: 500,
    }
  );
}

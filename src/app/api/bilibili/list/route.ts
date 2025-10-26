import type { NextRequest } from 'next/server';
import WbiSigner from '@/app/lib/api/utils/wbi_sign';
import Request from '@/app/lib/axios/request';
import { BilibiliHeaders } from '../../podcast/constants';

const BLACKLIST_MID = [
  '1643484295', // @岱川Doris
];

const BLACKLIST_KEYWORD = [
  '珈',
  '珈乐',
  '三姐',
  '341',
  '啵啵',
  '向晚',
  '嘉晚饭',
  '李滇滇',
  '李姐',
  '理解',
]; // 你B搜索结果里面掺大数据瞎推荐的视频的行为是真的烦人 :)

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
    ).data.data;
    const result = data.result
      .filter(
        (v: any) =>
          !(
            BLACKLIST_MID.includes(v.mid) && BLACKLIST_KEYWORD.includes(v.title)
          )
      )
      .map((v: any) => {
        const tmp = v;
        v.title = v.title
          .replace(/<em[^>]*>/gi, '')
          .replace(/<\/em>/gi, '')
          .replace(/<\\\/em>/gi, '')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&nbsp;/g, ' ')
          .replace(/&copy;/g, '©')
          .replace(/&reg;/g, '®')
          .replace(/&trade;/g, '™')
          .replace(/&mdash;/g, '—')
          .replace(/&ndash;/g, '–')
          .replace(/&hellip;/g, '…');
        return tmp;
      });
    return Response.json({
      code: 200,
      data: {
        current: data.page,
        current_size: data.pagesize,
        total: data.numPages,
        result,
      },
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

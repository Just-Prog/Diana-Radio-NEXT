import type { NextRequest } from 'next/server';
import WbiSigner from '@/app/lib/api/utils/wbi_sign';
import Request from '@/app/lib/axios/request';
import { BilibiliHeaders } from '../../podcast/constants';

type BilibiliSearchModuleResp = {
  result_type: string;
  data: any;
};

export async function GET(
  req: NextRequest,
  context: RouteContext<'/api/bilibili/list'>
) {
  try {
    const pageNum = req.nextUrl.searchParams.get('page') ?? 1;
    const target = 'https://api.bilibili.com/x/web-interface/search/all/v2';
    const params = await WbiSigner({
      page: pageNum,
      page_size: 30,
      tids: 3,
      device: 'win',
      mobi_app: 'pc_electron',
      keyword: '嘉然',
      web_location: 'bilibili-electron',
    });
    const data = (
      await Request.get(target, { params, headers: BilibiliHeaders })
    ).data.data.result.find(
      (v: BilibiliSearchModuleResp) => v.result_type === 'video'
    ).data;
    return Response.json({
      code: 200,
      data,
    });
  } catch (e) {
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

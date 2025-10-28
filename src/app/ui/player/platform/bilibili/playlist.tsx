'use client';
import { List, Pagination } from '@arco-design/web-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import image_404 from '@/app/assets/404.png';
import { BILIBILI_SEARCH } from '@/app/lib/axios/constants';
import Request from '@/app/lib/axios/request';
import type { SongInfoBilibili } from '@/app/main/page';
import IconFont from '../../../common/iconfont';

const PlaylistMetadata: React.FC<{
  type: string;
  size?: number;
  data: string | number;
}> = ({ type, data, size = 14 }) => {
  return (
    <span className="flex flex-row items-center gap-x-1">
      <IconFont size={size} type={type} />
      <p style={{ fontSize: size - 2 }}>{data}</p>
    </span>
  );
};

const PlaylistBilibili: React.FC<{
  currentPlaying: SongInfoBilibili;
  setCurrentPlaying: (v: SongInfoBilibili) => void;
}> = ({ setCurrentPlaying }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [maxPage, setMaxPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResult, setSearchResult] = useState([]);

  const fetchSearchResp = async () => {
    setIsLoading(true);
    const data = (await Request.get(BILIBILI_SEARCH, { params: { page } })).data
      .data;
    setSearchResult(data.result);
    setMaxPage(data.total);
    setPageSize(data.current_size);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSearchResp().then((_) => setIsLoading(false));
  }, [page]);

  return (
    <div className="flex h-full max-h-full min-h-full w-full flex-1 flex-col gap-y-2 py-2 md:px-2">
      <span className="font-semibold text-base">检索结果</span>
      <div className="flex-2 overflow-y-auto overflow-x-clip">
        <List
          dataSource={searchResult}
          loading={isLoading}
          noDataElement={
            <div className="my-4 flex flex-col items-center gap-y-4 text-center">
              <Image
                alt="empty"
                className="w-24 object-contain md:w-36"
                src={image_404}
              />
              <span>什么都没有</span>
            </div>
          }
          render={(v: any) => {
            return (
              <List.Item className="flex" onClick={() => setCurrentPlaying(v)}>
                <div className="flex h-20 flex-1 items-center md:h-18">
                  <div className="mr-3 h-12 w-16 overflow-clip rounded md:mr-4 md:h-18 md:h-18 md:w-32 md:rounded-xl">
                    {/** biome-ignore lint/performance/noImgElement: f**k ultracite */}
                    {/** biome-ignore lint/nursery/useImageSize: f**k ultracite */}
                    <img
                      alt=""
                      className="h-12 w-18 object-cover md:h-18 md:w-32"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      src={v.pic}
                    />
                  </div>
                  <div className="flex h-full flex-1 flex-col justify-between">
                    <span className="line-clamp-1 font-bold text-sm md:line-clamp-2 md:text-base">
                      {v.title}
                    </span>
                    <div className="md flex flex-col items-start justify-start gap-x-2 md:flex-row md:items-center">
                      <PlaylistMetadata data={v.author} type="icon-yonghu" />
                      <PlaylistMetadata data={v.bvid} type="icon-shipin" />
                      <PlaylistMetadata
                        data={`${v.play}次播放`}
                        type="icon-shipin1"
                      />
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
      <div className="flex flex-row justify-center gap-x-2">
        {/* <Button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          type="text"
        >
          <span>上一页</span>
        </Button> */}
        <Pagination
          onChange={(v) => setPage(v)}
          pageSize={pageSize}
          simple
          total={pageSize * maxPage}
        />
        {/* <Button onClick={() => setPage(page + 1)} type="text">
          <span>下一页</span>
        </Button> */}
      </div>
    </div>
  );
};

export default PlaylistBilibili;

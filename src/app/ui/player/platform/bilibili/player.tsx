'use client';
import type { NotificationHookReturnType } from '@arco-design/web-react';
import type { SongInfoBilibili } from '@/app/main/page';

type PlayerBilibiliAttrs = {
  notification: NotificationHookReturnType;
  songInfo: SongInfoBilibili;
  togglePlaylist: () => void;
};

const PlayerBilibili = ({
  notification,
  songInfo,
  togglePlaylist,
}: PlayerBilibiliAttrs) => {
  return <div>bilibili</div>;
};

export default PlayerBilibili;

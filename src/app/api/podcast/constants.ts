import hachimi_cover from '@/app/assets/program/hachimi.png';
import jianwen_cover from '@/app/assets/program/jianwen.png';
import sleep_cover from '@/app/assets/program/sleep.png';
import songs_cover from '@/app/assets/program/songs.png';

const PC_SONGS = '986394922'; // A-SOUL嘉然歌曲合集
const PC_SLEEPSTORY = '992840254'; // 嘉然睡前故事合集
const PC_JIANWENLU = '1220070148'; // 小然见闻录
const PC_HACHIMI = '1231330488'; // 嘉然的哈基米音乐

const DianaWeeklyAvailablePodcasts = {
  jianwen: PC_JIANWENLU,
  sleep: PC_SLEEPSTORY,
  songs: PC_SONGS,
  hachimi: PC_HACHIMI,
};

const DianaWeeklyAvailableProgramsInfo = [
  { name: 'A-SOUL嘉然歌曲合集', key: 'songs', cover: songs_cover },
  { name: '嘉然睡前故事合集', key: 'sleep', cover: sleep_cover },
  { name: '小然见闻录', key: 'jianwen', cover: jianwen_cover },
  { name: '嘉然的哈基米音乐', key: 'hachimi', cover: hachimi_cover },
];

export {
  PC_SONGS,
  PC_SLEEPSTORY,
  PC_JIANWENLU,
  PC_HACHIMI,
  hachimi_cover,
  songs_cover,
  jianwen_cover,
  sleep_cover,
  DianaWeeklyAvailablePodcasts,
  DianaWeeklyAvailableProgramsInfo,
};

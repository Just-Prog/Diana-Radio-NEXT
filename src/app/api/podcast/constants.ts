import hachimi_cover from '@/app/assets/program/hachimi.png';
import jianwen_cover from '@/app/assets/program/jianwen.png';
import sleep_cover from '@/app/assets/program/sleep.png';
import songs_cover from '@/app/assets/program/songs.png';
import three_kingdoms_cover from '@/app/assets/program/baijia.png';

const PC_SONGS = '986394922'; // A-SOUL嘉然歌曲合集
const PC_SLEEPSTORY = '992840254'; // 嘉然睡前故事合集
const PC_JIANWENLU = '1220070148'; // 小然见闻录
const PC_HACHIMI = '1231330488'; // 嘉然的哈基米音乐
const PC_SANGUO = '1480187002' //【百嘉讲坛】小然读三国

const DianaWeeklyAvailablePodcasts = {
  jianwen: PC_JIANWENLU,
  sleep: PC_SLEEPSTORY,
  songs: PC_SONGS,
  hachimi: PC_HACHIMI,
  three_kingdoms: PC_SANGUO
};

const DianaWeeklyAvailableProgramsInfo = [
  { name: 'A-SOUL嘉然歌曲合集', key: 'songs', cover: songs_cover },
  { name: '嘉然睡前故事合集', key: 'sleep', cover: sleep_cover },
  { name: '小然见闻录', key: 'jianwen', cover: jianwen_cover },
  { name: '嘉然的哈基米音乐', key: 'hachimi', cover: hachimi_cover },
  { name: '【百嘉讲坛】小然读三国', key: 'three_kingdoms', cover: three_kingdoms_cover }
];

const BilibiliCookies = {
  sessdata: '',
};

const BilibiliHeaders = {
  accept: '*/*',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
  origin: 'https://www.bilibili.com',
  referer: 'https://www.bilibili.com/client',
  'sec-ch-ua':
    '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': 'windows',
  cookie: 'SESSDATA=;',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.5.1.4',
};

export {
  PC_SONGS,
  PC_SLEEPSTORY,
  PC_JIANWENLU,
  PC_HACHIMI,
  PC_SANGUO,
  hachimi_cover,
  songs_cover,
  jianwen_cover,
  sleep_cover,
  three_kingdoms_cover,
  DianaWeeklyAvailablePodcasts,
  DianaWeeklyAvailableProgramsInfo,
  BilibiliHeaders,
  BilibiliCookies,
};

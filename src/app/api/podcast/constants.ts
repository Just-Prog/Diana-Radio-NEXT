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
  { name: 'A-SOUL嘉然歌曲合集', key: 'songs' },
  { name: '嘉然睡前故事合集', key: 'sleep' },
  { name: '小然见闻录', key: 'jianwen' },
  { name: '嘉然的哈基米音乐', key: 'hachimi' },
];

export {
  PC_SONGS,
  PC_SLEEPSTORY,
  PC_JIANWENLU,
  PC_HACHIMI,
  DianaWeeklyAvailablePodcasts,
  DianaWeeklyAvailableProgramsInfo,
};

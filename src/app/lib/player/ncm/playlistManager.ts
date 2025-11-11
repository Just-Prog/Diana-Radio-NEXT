import type { SongInfo } from "@/app/main/page";
import { currentPlayingStorage, playlistCache } from "./storage";

export type PlaylistManagerOptions = {
  onSongChange?: (song: SongInfo) => void;
  onPlaylistUpdate?: (songs: SongInfo[]) => void;
};

export class PlaylistManager {
  private currentPlaylist: SongInfo[] = [];
  private currentIndex = -1;
  private currentType = "";
  private readonly onSongChange?: (song: SongInfo) => void;
  private readonly onPlaylistUpdate?: (songs: SongInfo[]) => void;

  constructor(options: PlaylistManagerOptions = {}) {
    this.onSongChange = options.onSongChange;
    this.onPlaylistUpdate = options.onPlaylistUpdate;

    // 恢复之前的播放状态
    this.restorePlayingState();
  }

  // 设置播放列表
  setPlaylist(songs: SongInfo[], type: string): void {
    this.currentPlaylist = songs;
    this.currentType = type;
    this.currentIndex = -1;

    // 缓存播放列表
    playlistCache.set(type, songs);

    this.onPlaylistUpdate?.(songs);
  }

  // 从缓存加载播放列表
  loadPlaylistFromCache(type: string): boolean {
    const cached = playlistCache.get(type);
    if (cached && cached.data.length > 0) {
      this.currentPlaylist = cached.data;
      this.currentType = type;
      this.currentIndex = -1;
      this.onPlaylistUpdate?.(cached.data);
      return true;
    }
    return false;
  }

  // 播放指定歌曲
  playSong(song: SongInfo): void {
    const index = this.currentPlaylist.findIndex((s) => s.id === song.id);
    if (index !== -1) {
      this.currentIndex = index;
      this.notifySongChange(song);

      return;
    }

    // 如果歌曲不在当前播放列表中，创建新的播放列表
    this.currentPlaylist = [song];
    this.currentIndex = 0;
    this.currentType = song.type || "";
    this.notifySongChange(song);
  }

  // 上一首
  playPrevious(): SongInfo | null {
    if (this.currentPlaylist.length === 0) return null;

    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      // 如果在第一首，循环到最后一首
      this.currentIndex = this.currentPlaylist.length - 1;
    }

    const song = this.currentPlaylist[this.currentIndex];
    this.notifySongChange(song);

    return song;
  }

  // 下一首
  playNext(): SongInfo | null {
    if (this.currentPlaylist.length === 0) {
      return null;
    }

    if (this.currentIndex < this.currentPlaylist.length - 1) {
      this.currentIndex++;
    } else {
      // 如果在最后一首，循环到第一首
      this.currentIndex = 0;
    }

    const song = this.currentPlaylist[this.currentIndex];
    this.notifySongChange(song);

    return song;
  }

  // 获取当前歌曲
  getCurrentSong(): SongInfo | null {
    if (
      this.currentIndex >= 0 &&
      this.currentIndex < this.currentPlaylist.length
    ) {
      return this.currentPlaylist[this.currentIndex];
    }
    return null;
  }

  // 获取播放列表
  getPlaylist(): SongInfo[] {
    return [...this.currentPlaylist];
  }

  // 获取当前索引
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  // 获取播放列表类型
  getCurrentType(): string {
    return this.currentType;
  }

  // 是否有上一首
  hasPrevious(): boolean {
    return this.currentPlaylist.length > 0;
  }

  // 是否有下一首
  hasNext(): boolean {
    return this.currentPlaylist.length > 0;
  }

  // 获取播放进度信息
  getProgressInfo(): { current: number; total: number; percentage: number } {
    const total = this.currentPlaylist.length;
    const current = this.currentIndex + 1;
    const FULL_PERCENTAGE = 100;
    const percentage = total > 0 ? (current / total) * FULL_PERCENTAGE : 0;

    return { current, total, percentage };
  }

  // 保存播放状态
  savePlayingState(): void {
    const currentSong = this.getCurrentSong();
    if (currentSong) {
      currentPlayingStorage.set(currentSong);
    }
  }

  // 恢复播放状态
  restorePlayingState(): void {
    const savedSong = currentPlayingStorage.get();
    if (!savedSong?.type) {
      return;
    }
    // 尝试从缓存恢复播放列表
    if (this.loadPlaylistFromCache(savedSong.type)) {
      // 在播放列表中找到保存的歌曲
      const index = this.currentPlaylist.findIndex(
        (s) => s.id === savedSong.id
      );
      if (index !== -1) {
        this.currentIndex = index;
      }
    }
  }

  // 清空播放状态
  clearPlayingState(): void {
    currentPlayingStorage.set(null);
    this.currentIndex = -1;
  }

  // 随机播放
  shuffle(): SongInfo | null {
    if (this.currentPlaylist.length === 0) return null;

    // 生成随机索引
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * this.currentPlaylist.length);
    } while (
      randomIndex === this.currentIndex &&
      this.currentPlaylist.length > 1
    );

    this.currentIndex = randomIndex;
    const song = this.currentPlaylist[this.currentIndex];
    this.notifySongChange(song);

    return song;
  }

  // 通知歌曲变更
  private notifySongChange(song: SongInfo): void {
    this.savePlayingState();
    this.onSongChange?.(song);
  }
}

// 创建单例实例
let playlistManagerInstance: PlaylistManager | null = null;

export const getPlaylistManager = (
  options?: PlaylistManagerOptions
): PlaylistManager => {
  if (!playlistManagerInstance) {
    playlistManagerInstance = new PlaylistManager(options);
  }
  return playlistManagerInstance;
};

export const resetPlaylistManager = (): void => {
  playlistManagerInstance = null;
};

import type { SongInfo } from "@/app/main/page";

const STORAGE_KEYS = {
  PLAYLIST_CACHE: "playlist_cache",
  CURRENT_PLAYING: "current_playing",
} as const;

const HOURS_24 = 24;
const MINUTES_60 = 60;
const SECONDS_60 = 60;

export type PlaylistCache = {
  type: string;
  data: SongInfo[];
};

// 播放列表缓存管理
export const playlistCache = {
  get(type: string): PlaylistCache | null {
    try {
      const cached = localStorage.getItem(
        `${STORAGE_KEYS.PLAYLIST_CACHE}_${type}`
      );
      if (!cached) {
        return null;
      }

      const parsed: PlaylistCache = JSON.parse(cached);
      return parsed;
    } catch {
      return null;
    }
  },

  set(type: string, data: SongInfo[]): void {
    try {
      const cache: PlaylistCache = {
        type,
        data,
      };
      localStorage.setItem(
        `${STORAGE_KEYS.PLAYLIST_CACHE}_${type}`,
        JSON.stringify(cache)
      );
    } catch {
      // 静默处理缓存错误
    }
  },

  clear(type: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEYS.PLAYLIST_CACHE}_${type}`);
    } catch {
      // 静默处理缓存错误
    }
  },

  clearAll(): void {
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(STORAGE_KEYS.PLAYLIST_CACHE)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // 静默处理缓存错误
    }
  },
};

// 当前播放状态管理
export const currentPlayingStorage = {
  get(): SongInfo | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYING);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  set(song: SongInfo | null): void {
    try {
      if (song) {
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_PLAYING,
          JSON.stringify(song)
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAYING);
      }
    } catch {
      // 静默处理存储错误
    }
  },
};

// 工具函数
export const storageUtils = {
  // 检查本地存储是否可用
  isAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // 获取缓存大小信息
  getCacheInfo(): { size: number; types: string[] } {
    const types: string[] = [];
    let size = 0;

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STORAGE_KEYS.PLAYLIST_CACHE)) {
        const type = key.replace(`${STORAGE_KEYS.PLAYLIST_CACHE}_`, "");
        types.push(type);
        size += localStorage.getItem(key)?.length || 0;
      }
    }

    return { size, types };
  },
};

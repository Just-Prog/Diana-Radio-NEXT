import { dj_program_detail, lyric, song_url } from "NeteaseCloudMusicApi";
import type { NextRequest } from "next/server";
import { DianaWeeklyAvailablePodcasts } from "@/app/api/podcast/constants";
import { refreshAll } from "@/app/lib/api/podcast";
import redis from "@/app/lib/redis";

type songInfoResp = {
  br: number;
  code: number;
  md5: string;
  type: string;
  url: string;
};

type genericSongInfoResp = {
  id: number;
  name: string;
  alias: string[];
  artists: string[];
  album: {
    picUrl: string;
  };
};

type lyrics163Resp = { lyric: string };
type lyricsResp = { time: number; text: string };

// 过滤函数，只保留 genericSongInfoResp 中定义的字段
function filterGenericSongInfoResp(data: unknown): genericSongInfoResp {
  if (!data || typeof data !== "object") {
    return {
      id: 0,
      name: "",
      alias: [],
      artists: [],
      album: { picUrl: "" },
    };
  }

  const dataObj = data as Record<string, unknown>;

  return {
    id: Number(dataObj.id) || 0,
    name: String(dataObj.name || ""),
    alias: Array.isArray(dataObj.alias) ? dataObj.alias.map(String) : [],
    artists: Array.isArray(dataObj.artists)
      ? dataObj.artists.map((artist: unknown) =>
          String((artist as Record<string, unknown>)?.name || "")
        )
      : [],
    album: {
      picUrl: String((dataObj.album as Record<string, unknown>)?.picUrl || ""),
    },
  };
}

// 过滤相关歌曲数组
function filterRelatedSongs(songs: unknown): genericSongInfoResp[] {
  if (!Array.isArray(songs)) {
    return [];
  }
  return songs.map((song) => filterGenericSongInfoResp(song));
}

const lrcTSRegex = /\[(\d{2}:\d{2}.\d{2})\](.*)/;

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/podcast/fetch/[id]">
) {
  const { id } = await ctx.params;

  // Check if the ID exists in any of the programs lists
  const programTypes = Object.keys(DianaWeeklyAvailablePodcasts);

  const programInited = await redis.get(`${programTypes[0]}_updated_at`);

  if (!programInited) {
    await refreshAll();
  }

  for (const type of programTypes) {
    const programsData = await redis.get(`${type}_programs`);
    if (programsData) {
      const programs = JSON.parse(programsData);
      const target = programs.find(
        (program: any) => String(program.id) === String(id)
      );
      if (target) {
        const res: songInfoResp[] = (await song_url({ id })).body
          .data as songInfoResp[];
        const programDetail = await dj_program_detail({ id: target.pid });
        const rawProgramData = programDetail.body.program;

        // 获取相关歌曲数据并过滤
        const rawSongs = (rawProgramData as Record<string, unknown>)?.songs;
        const filteredRelatedSongs = filterRelatedSongs(rawSongs);

        let lyrics: lyricsResp[] = [];

        if (filteredRelatedSongs.length !== 0) {
          const tmp: lyrics163Resp = (
            await lyric({ id: filteredRelatedSongs[0].id })
          ).body.lrc as lyrics163Resp;
          lyrics = tmp.lyric
            .split("\n")
            .map((v) => {
              const matched = v.match(lrcTSRegex);
              if (matched) {
                const time =
                  Number.parseInt(matched[1].split(":")[0]) * 60 +
                  Number.parseInt(matched[1].split(":")[1]); // lrc HH:mm:ss => minutes
                return {
                  time,
                  text: matched[2],
                };
              }
              return;
            })
            .filter((v): v is lyricsResp => v !== undefined);
        }

        const data = res[0];
        return Response.json({
          code: data.code,
          data: {
            br: data.br,
            md5: data.md5,
            type: data.type,
            url: data.url,
            related: filteredRelatedSongs,
            lrc: filteredRelatedSongs.length !== 0 ? lyrics : null,
          },
        });
      }
    }
  }
  return Response.json(
    { code: 403, message: "audio id not in whitelist" },
    { status: 403 }
  );
}

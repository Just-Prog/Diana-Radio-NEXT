import type { NextRequest } from "next/server";
import { refreshAll } from "@/app/lib/api/podcast";
import redis from "@/app/lib/redis";
import { DianaWeeklyAvailablePodcasts } from "../../constants";

const fetchFromDB = async (type: string) => {
  // console.log(`⭐Hit Cache (target: ${type})`);
  const count = await redis.get(`${type}_count`);
  const updated_at = await redis.get(`${type}_updated_at`);
  const programs = JSON.parse((await redis.get(`${type}_programs`)) ?? "{}");
  return {
    count,
    updated_at,
    programs,
  };
};

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/podcast/list/[type]">
) {
  const { type } = await ctx.params;

  const isValidType = (
    key: string
  ): key is keyof typeof DianaWeeklyAvailablePodcasts =>
    key in DianaWeeklyAvailablePodcasts;

  if (isValidType(type)) {
    const isUpdated = (await redis.get(`${type}_updated_at`)) ?? 0;
    if (
      isUpdated &&
      Number.parseInt(String(Date.now() / 1000), 10) - Number(isUpdated) <
        86_400
    ) {
      return Response.json(await fetchFromDB(type));
    }

    await refreshAll();
    return Response.json(await fetchFromDB(type));
  }

  return Response.json({
    code: 501,
    message: "program list restricted by whitelist",
  });
}

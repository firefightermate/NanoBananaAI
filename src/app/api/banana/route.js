import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/services/ai";
import { prisma } from "@/lib/prisma";

// Per-account daily ceiling — protects the fal balance from runaway loops
// and scripted abuse. Generous enough that no honest user hits it.
const DAILY_RENDER_LIMIT = 30;

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const todayCount = await prisma.creation.count({
      where: { userId: session.user.id, createdAt: { gte: startOfDay } },
    });
    if (todayCount >= DAILY_RENDER_LIMIT) {
      return NextResponse.json(
        { error: `Daily limit reached (${DAILY_RENDER_LIMIT} renders). Resets at midnight UTC.` },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { mode, prompt, aspect_ratio, resolution, google_search, images_list } = body;

    if (!prompt && mode !== 'edit') {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let result;
    if (mode === "edit") {
      result = await AIService.edit(session.user.id, {
        prompt,
        images_list,
        aspect_ratio,
        resolution,
        google_search,
      });
    } else {
      result = await AIService.generate(session.user.id, {
        prompt,
        aspect_ratio,
        resolution,
        google_search,
      });
    }

    return NextResponse.json({
      ...result,
      metadata: { prompt, aspect_ratio, resolution }
    });
  } catch (error) {
    if (error.message === "Insufficient credits") {
      return new NextResponse("Insufficient credits", { status: 403 });
    }
    console.error("[AI_BANANA]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

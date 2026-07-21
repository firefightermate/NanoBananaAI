import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * fal.ai queue webhook.
 * Payload: { request_id, gateway_request_id, status: "OK" | "ERROR", payload, error }
 */
export async function POST(req) {
  try {
    const data = await req.json();
    const requestId = data.request_id;

    if (!requestId) {
      console.error("[FAL_WEBHOOK] Missing request_id in payload", data);
      return NextResponse.json({ error: "Missing request_id" }, { status: 400 });
    }

    const creation = await prisma.creation.findUnique({ where: { requestId } });
    if (!creation) {
      console.warn(`[FAL_WEBHOOK] Creation with requestId ${requestId} not found.`);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (data.status === "ERROR" || data.error) {
      const message =
        typeof data.error === "string"
          ? data.error
          : data.error?.detail || data.payload?.detail || "Generation failed";

      await prisma.creation.update({
        where: { id: creation.id },
        data: { status: "failed", error: message },
      });

      return NextResponse.json({ success: true });
    }

    const images = data.payload?.images || [];
    const first = images[0];
    const imageUrl = typeof first === "string" ? first : first?.url || null;

    await prisma.creation.update({
      where: { id: creation.id },
      data: imageUrl
        ? { status: "completed", imageUrl }
        : { status: "failed", error: "fal returned no image" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FAL_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

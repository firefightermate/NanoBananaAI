import config from "@/lib/config";
import { UserService } from "./user";
import { prisma } from "@/lib/prisma";

const FAL_QUEUE = "https://queue.fal.run";

/**
 * fal.ai endpoints backing the generator.
 * Text-to-image and image editing are separate endpoints on the same model family.
 */
const ENDPOINTS = {
  generate: config.ai.fal.model,
  edit: `${config.ai.fal.model}/edit`,
};

/** fal expects "1K" / "2K" / "4K"; the UI speaks lowercase. */
function toFalResolution(resolution) {
  switch ((resolution || "").toLowerCase()) {
    case "2k": return "2K";
    case "4k": return "4K";
    default: return "1K";
  }
}

/** fal uses "auto" rather than the template's "Auto". */
function toFalAspectRatio(aspectRatio) {
  if (!aspectRatio || aspectRatio.toLowerCase() === "auto") return "auto";
  return aspectRatio;
}

function falHeaders() {
  const apiKey = config.ai.fal.apiKey;
  if (!apiKey) throw new Error("FAL_KEY is not configured");
  return {
    "Content-Type": "application/json",
    Authorization: `Key ${apiKey}`,
  };
}

/** Pull the first image URL out of a fal result payload. */
function extractImageUrl(payload) {
  const images = payload?.images || payload?.output?.images || [];
  const first = images[0];
  if (!first) return null;
  return typeof first === "string" ? first : first.url || null;
}

/**
 * Service to manage AI generations and interactions.
 * Backed by fal.ai's queue API (nano-banana / Gemini image models).
 */
export const AIService = {
  /**
   * Credit cost per render. 1 credit = $0.01 of pack value; prices are set
   * at ~2x the fal compute cost ($0.08/image at 1K).
   */
  getCreditCost(resolution) {
    switch ((resolution || "").toLowerCase()) {
      case "2k": return 24;
      case "4k": return 32;
      case "1k":
      default: return 16;
    }
  },

  /**
   * Submit a job to the fal queue and record it as a pending Creation.
   */
  async submit(userId, endpoint, input, { prompt, aspect_ratio, resolution }) {
    const webhookUrl = `${config.auth.webhook_url}/api/webhook/fal`;
    const submitUrl = `${FAL_QUEUE}/${endpoint}?fal_webhook=${encodeURIComponent(webhookUrl)}`;

    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: falHeaders(),
      body: JSON.stringify(input),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      throw new Error(`fal submission failed: ${submitRes.status} ${errorText}`);
    }

    const { request_id } = await submitRes.json();
    if (!request_id) throw new Error("No request_id received from fal");

    await prisma.creation.create({
      data: {
        userId,
        prompt: prompt || "",
        aspectRatio: aspect_ratio,
        resolution,
        requestId: request_id,
        status: "processing",
      },
    });

    return { request_id };
  },

  /**
   * Text-to-image generation.
   */
  async generate(userId, { prompt, aspect_ratio = "1:1", resolution = "1k", google_search = false }) {
    const cost = this.getCreditCost(resolution);
    await UserService.deductCredits(userId, cost);

    return this.submit(
      userId,
      ENDPOINTS.generate,
      {
        prompt,
        aspect_ratio: toFalAspectRatio(aspect_ratio),
        resolution: toFalResolution(resolution),
        enable_web_search: Boolean(google_search),
        num_images: 1,
        output_format: "jpeg",
      },
      { prompt, aspect_ratio, resolution },
    );
  },

  /**
   * Image editing from one or more reference images.
   */
  async edit(userId, { prompt, images_list = [], aspect_ratio = "Auto", google_search = false, resolution = "1k" }) {
    const cost = this.getCreditCost(resolution);
    await UserService.deductCredits(userId, cost);

    return this.submit(
      userId,
      ENDPOINTS.edit,
      {
        prompt,
        image_urls: images_list,
        aspect_ratio: toFalAspectRatio(aspect_ratio),
        resolution: toFalResolution(resolution),
        enable_web_search: Boolean(google_search),
        num_images: 1,
        output_format: "jpeg",
      },
      { prompt, aspect_ratio, resolution },
    );
  },

  /**
   * Check status of a request. Reads the DB first (webhook path), then falls
   * back to polling the fal queue directly.
   */
  async checkStatus(requestId, userId, metadata) {
    const creation = await prisma.creation.findUnique({ where: { requestId } });
    if (!creation) return { status: "processing" };

    if (creation.status === "completed") {
      return { status: "completed", imageUrl: creation.imageUrl };
    }
    if (creation.status === "failed") {
      throw new Error(creation.error || "Generation failed.");
    }

    // The endpoint the job was submitted to isn't stored, so try both bases.
    const bases = [ENDPOINTS.generate, ENDPOINTS.edit];

    for (const base of bases) {
      try {
        const statusRes = await fetch(
          `${FAL_QUEUE}/${base}/requests/${requestId}/status`,
          { headers: falHeaders() },
        );
        if (!statusRes.ok) continue;

        const { status } = await statusRes.json();

        if (status === "COMPLETED") {
          const resultRes = await fetch(
            `${FAL_QUEUE}/${base}/requests/${requestId}`,
            { headers: falHeaders() },
          );
          if (!resultRes.ok) continue;

          const payload = await resultRes.json();
          const imageUrl = extractImageUrl(payload);
          if (!imageUrl) continue;

          const updated = await prisma.creation.update({
            where: { id: creation.id },
            data: { status: "completed", imageUrl },
          });
          return { status: "completed", imageUrl: updated.imageUrl };
        }

        // IN_QUEUE / IN_PROGRESS — the job exists on this base, stop probing.
        return { status: "processing" };
      } catch (err) {
        console.error("[FAL_STATUS]", err);
      }
    }

    return { status: "processing" };
  },
};

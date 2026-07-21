"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiZap,
  FiImage,
  FiEdit3,
  FiSearch,
  FiDownload,
  FiPlus,
  FiTrash2,
  FiX,
  FiCornerUpLeft,
  FiMaximize2,
} from "react-icons/fi";
import { downloadImage } from "@/lib/utils";
import Aurora from "@/components/landing/Aurora";

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

const ASPECT_RATIOS = [
  { label: "1:1", value: "1:1", w: 1, h: 1 },
  { label: "16:9", value: "16:9", w: 16, h: 9 },
  { label: "9:16", value: "9:16", w: 9, h: 16 },
  { label: "4:3", value: "4:3", w: 4, h: 3 },
  { label: "3:4", value: "3:4", w: 3, h: 4 },
  { label: "3:2", value: "3:2", w: 3, h: 2 },
  { label: "2:3", value: "2:3", w: 2, h: 3 },
  { label: "21:9", value: "21:9", w: 21, h: 9 },
  { label: "9:21", value: "9:21", w: 9, h: 21 },
  { label: "4:5", value: "4:5", w: 4, h: 5 },
  { label: "5:4", value: "5:4", w: 5, h: 4 },
  { label: "Auto", value: "Auto", w: 5, h: 4, auto: true },
];

const RESOLUTIONS = [
  { value: "1k", cost: 12 },
  { value: "2k", cost: 18 },
  { value: "4k", cost: 24 },
];

const IDEAS = [
  "A lighthouse made of stained glass at blue hour",
  "Street food market on a rain-slicked Mars colony",
  "Botanical illustration of an impossible flower, gold ink",
  "A tiny dragon asleep in a teacup, macro photography",
  "Cutaway of a whale-shaped airship, warm cabin light",
  "Neo-noir detective office, venetian blind shadows",
];

const STATUS_LINES = [
  "Reading the prompt…",
  "Composing the frame…",
  "Diffusing pixels…",
  "Refining edges…",
  "Balancing light…",
  "Almost there…",
];

/* ------------------------------------------------------------------ */
/* Small pieces                                                       */
/* ------------------------------------------------------------------ */

/** Mini frame that previews the actual shape of an aspect ratio. */
function RatioGlyph({ ratio, active }) {
  const max = 22;
  const scale = max / Math.max(ratio.w, ratio.h);
  return (
    <span
      className="flex items-center justify-center"
      style={{ width: max, height: max }}
    >
      <span
        className={`rounded-[3px] border transition-colors ${
          active ? "border-primary-btn-text bg-primary-btn-text/20" : "border-current"
        } ${ratio.auto ? "border-dashed" : ""}`}
        style={{ width: ratio.w * scale, height: ratio.h * scale }}
      />
    </span>
  );
}

/** Orbiting-particle loader shown while a job renders. */
function ParticleLoader({ resolution, ratioLabel, statusIndex }) {
  const particles = Array.from({ length: 7 });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="flex flex-col items-center gap-10"
    >
      <div className="relative h-44 w-44">
        {/* rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-glass-border"
          style={{ borderTopColor: "var(--color-primary)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
          className="absolute inset-5 rounded-full border border-glass-border"
          style={{ borderBottomColor: "var(--accent)" }}
        />
        {/* orbiting particles */}
        {particles.map((_, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            style={{
              background: i % 2 ? "var(--accent)" : "var(--color-primary)",
              boxShadow: "0 0 8px currentColor",
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span
              className="absolute block h-1.5 w-1.5 rounded-full"
              style={{
                background: "inherit",
                transform: `translateX(${34 + i * 9}px)`,
              }}
            />
          </motion.span>
        ))}
        {/* breathing core */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 m-auto h-12 w-12 rounded-2xl bg-primary/20 blur-md"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FiZap className="text-2xl text-primary" />
        </div>
      </div>

      <div className="space-y-3 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={statusIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-bold tracking-tight"
          >
            {STATUS_LINES[statusIndex]}
          </motion.div>
        </AnimatePresence>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary-text">
          {resolution} · {ratioLabel}
        </div>
      </div>
    </motion.div>
  );
}

/** Empty state: pulsing orb + clickable idea chips. */
function EmptyState({ mode, onIdea }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-2xl space-y-10 text-center"
    >
      <div className="relative mx-auto h-28 w-28">
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.14, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary blur-2xl"
        />
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-full w-full items-center justify-center rounded-[2rem] border border-glass-border bg-glass-bg backdrop-blur"
        >
          {mode === "generate" ? (
            <FiImage className="text-3xl text-primary" />
          ) : (
            <FiEdit3 className="text-3xl text-primary" />
          )}
        </motion.div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight">
          {mode === "generate" ? "What are we making?" : "What should change?"}
        </h2>
        <p className="text-sm text-secondary-text">
          {mode === "generate"
            ? "Describe it below — or steal one of these."
            : "Add reference images below, then describe the edit."}
        </p>
      </div>

      {mode === "generate" && (
        <div className="flex flex-wrap justify-center gap-2">
          {IDEAS.map((idea, i) => (
            <motion.button
              key={idea}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onIdea(idea)}
              className="rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-xs font-medium text-secondary-text backdrop-blur transition-colors hover:border-primary/40 hover:text-primary-text"
            >
              {idea}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function Create() {
  const { data: session } = useSession();

  const [mode, setMode] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [googleSearch, setGoogleSearch] = useState(false);
  const [imagesList, setImagesList] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [openPanel, setOpenPanel] = useState(null); // 'ratio' | 'refs' | null
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);
  const textareaRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]); // {url, prompt}

  // Typewriter placeholder cycling through ideas.
  const [placeholder, setPlaceholder] = useState("");
  const placeholderIdea = useRef(0);
  useEffect(() => {
    if (prompt) return;
    let i = 0;
    let cancelled = false;
    const idea =
      mode === "generate"
        ? IDEAS[placeholderIdea.current % IDEAS.length]
        : "Make the sky a violent sunset and add rain…";
    const tick = () => {
      if (cancelled) return;
      i++;
      setPlaceholder(idea.slice(0, i));
      if (i < idea.length) {
        setTimeout(tick, 34);
      } else {
        setTimeout(() => {
          if (cancelled) return;
          placeholderIdea.current++;
          setPlaceholder("");
          i = 0;
        }, 2600);
      }
    };
    const start = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [prompt, mode, placeholder === ""]);

  // Close popover on outside click.
  useEffect(() => {
    function onDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    setAspectRatio(
      mode === "edit"
        ? ASPECT_RATIOS.find((r) => r.value === "Auto")
        : ASPECT_RATIOS[0],
    );
  }, [mode]);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(
      () => setStatusIndex((i) => (i + 1) % STATUS_LINES.length),
      2400,
    );
    return () => clearInterval(id);
  }, [loading]);

  // Cursor-glow position on the command bar.
  const glowX = useMotionValue(0.5);
  const glowSpring = useSpring(glowX, { stiffness: 120, damping: 20 });
  const glowLeft = useTransform(glowSpring, (v) => `${v * 100}%`);

  /* ---------------- API plumbing (unchanged behaviour) ------------- */

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setError("PNG, JPG or JPEG only.");
      return;
    }
    if (!session) return signIn();
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds the 5MB limit.");
      return;
    }
    try {
      setIsUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed.");
      const data = await res.json();
      if (data.url && imagesList.length < 14) {
        setImagesList((l) => [...l, data.url]);
      }
    } catch (err) {
      setError("Upload failed. Try a URL instead.");
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const pollStatus = useCallback(async (requestId, metadata, promptUsed) => {
    try {
      const res = await fetch("/api/banana/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, metadata }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status check failed.");

      if (data.status === "completed") {
        setResultUrl(data.imageUrl);
        setHistory((h) => [{ url: data.imageUrl, prompt: promptUsed }, ...h].slice(0, 12));
        setLoading(false);
      } else if (data.status === "failed") {
        throw new Error(data.error || "Generation failed.");
      } else {
        setTimeout(() => pollStatus(requestId, metadata, promptUsed), 3000);
      }
    } catch (err) {
      setError(err.message || "Something went wrong while rendering.");
      setLoading(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!session) return signIn();
    if (mode === "generate" && !prompt.trim()) return;
    if (mode === "edit" && imagesList.length === 0) {
      setError("Add at least one reference image to edit.");
      setOpenPanel("refs");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultUrl(null);
      setStatusIndex(0);
      setOpenPanel(null);

      const res = await fetch("/api/banana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt,
          aspect_ratio: aspectRatio.value,
          resolution: resolution.value,
          google_search: googleSearch,
          images_list: imagesList,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start the job.");
      await pollStatus(data.request_id, data.metadata, prompt);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const useAsReference = (url) => {
    setMode("edit");
    setImagesList((l) => (l.length < 14 ? [...l, url] : l));
    setOpenPanel("refs");
    textareaRef.current?.focus();
  };

  const canGenerate =
    !loading &&
    ((mode === "generate" && prompt.trim()) ||
      (mode === "edit" && imagesList.length > 0));

  /* ---------------- Render ---------------------------------------- */

  return (
    <div className="relative flex h-[calc(100dvh-69px)] flex-col overflow-hidden">
      <Aurora />

      {/* Mode switch — floating top centre */}
      <div className="relative z-20 flex justify-center pt-5">
        <div className="flex rounded-full border border-glass-border bg-glass-bg p-1 backdrop-blur-xl">
          {[
            { id: "generate", label: "Generate", Icon: FiImage },
            { id: "edit", label: "Edit", Icon: FiEdit3 },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`relative flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                mode === id ? "text-primary-btn-text" : "text-secondary-text hover:text-primary-text"
              }`}
            >
              {mode === id && (
                <motion.span
                  layoutId="create-mode-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-primary"
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon className="text-sm" />
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-6 py-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          {!resultUrl && !loading && !error && (
            <EmptyState
              key={`empty-${mode}`}
              mode={mode}
              onIdea={(idea) => {
                setPrompt(idea);
                textareaRef.current?.focus();
              }}
            />
          )}

          {loading && (
            <ParticleLoader
              key="loading"
              resolution={resolution.value.toUpperCase()}
              ratioLabel={aspectRatio.label}
              statusIndex={statusIndex}
            />
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm space-y-4 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center backdrop-blur"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
                Render failed
              </div>
              <p className="text-sm leading-relaxed text-secondary-text">
                {typeof error === "string" ? error : "Request failed. Check your credits."}
              </p>
              <button
                onClick={() => setError(null)}
                className="rounded-full border border-glass-border px-5 py-2 text-xs font-semibold transition-colors hover:bg-glass-hover"
              >
                Try again
              </button>
            </motion.div>
          )}

          {resultUrl && !loading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.94, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group relative max-w-full overflow-hidden rounded-2xl border border-glass-border shadow-[0_50px_140px_-40px_rgba(0,0,0,0.95)]"
            >
              <img
                src={resultUrl}
                alt={prompt}
                className="h-auto max-h-[62vh] w-auto max-w-full"
              />
              {/* hover actions */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                <p className="min-w-0 truncate text-xs font-medium text-white/90">
                  {prompt || "Untitled"}
                </p>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => useAsReference(resultUrl)}
                    title="Use as reference for an edit"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition-transform hover:scale-105"
                  >
                    <FiCornerUpLeft className="text-sm" />
                  </button>
                  <button
                    onClick={async () => {
                      setDownloading(true);
                      await downloadImage(resultUrl, `kalium-${Date.now()}.jpg`);
                      setDownloading(false);
                    }}
                    disabled={downloading}
                    title="Download"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    {downloading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    ) : (
                      <FiDownload className="text-sm" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session history rail */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-4 top-1/2 hidden max-h-[60vh] -translate-y-1/2 flex-col gap-2 overflow-y-auto no-scrollbar lg:flex"
            >
              {history.map((item, i) => (
                <motion.button
                  key={item.url + i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, x: -4 }}
                  onClick={() => setResultUrl(item.url)}
                  title={item.prompt}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                    resultUrl === item.url ? "border-primary" : "border-glass-border"
                  }`}
                >
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command bar */}
      <div className="relative z-30 px-4 pb-5 sm:px-6">
        <div ref={panelRef} className="relative mx-auto w-full max-w-3xl">
          {/* Popover panels */}
          <AnimatePresence>
            {openPanel === "ratio" && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="glass-dropdown absolute bottom-full left-0 right-0 z-40 mb-3 rounded-2xl p-4 shadow-2xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text">
                    Frame
                  </span>
                  <span className="text-[10px] font-bold text-primary">
                    {aspectRatio.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => {
                        setAspectRatio(ratio);
                        setOpenPanel(null);
                      }}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                        aspectRatio.value === ratio.value
                          ? "border-primary/60 bg-primary text-primary-btn-text"
                          : "border-glass-border bg-bg-page/40 text-secondary-text hover:border-primary/30 hover:text-primary-text"
                      }`}
                    >
                      <RatioGlyph ratio={ratio} active={aspectRatio.value === ratio.value} />
                      <span className="text-[10px] font-bold">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {openPanel === "refs" && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="glass-dropdown absolute bottom-full left-0 right-0 z-40 mb-3 rounded-2xl p-4 shadow-2xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text">
                    Reference images · {imagesList.length}/14
                  </span>
                  <button
                    onClick={() => setOpenPanel(null)}
                    className="text-secondary-text hover:text-primary-text"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newImageUrl && imagesList.length < 14) {
                        setImagesList((l) => [...l, newImageUrl]);
                        setNewImageUrl("");
                      }
                    }}
                    placeholder="Paste an image URL and press Enter…"
                    className="flex-1 rounded-lg border border-glass-border bg-bg-page/60 px-3 py-2 text-xs outline-none focus:border-primary/50"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept=".png, .jpg, .jpeg"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => {
                      if (!session) return signIn();
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading || imagesList.length >= 14}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-btn-text disabled:opacity-40"
                  >
                    {isUploading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <FiPlus />
                    )}
                    Upload
                  </button>
                </div>

                {imagesList.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-7">
                    {imagesList.map((url, idx) => (
                      <motion.div
                        key={url + idx}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-glass-border"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() =>
                            setImagesList((l) => l.filter((_, i) => i !== idx))
                          }
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <FiTrash2 className="text-sm text-red-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The bar itself */}
          <motion.div
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              glowX.set((e.clientX - rect.left) / rect.width);
            }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            {/* cursor glow along the top edge */}
            <motion.span
              className="pointer-events-none absolute top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
              style={{ left: glowLeft }}
            />

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canGenerate) handleGenerate();
                }
              }}
              placeholder={placeholder || " "}
              rows={2}
              className="w-full resize-none bg-transparent px-5 pt-4 text-[15px] leading-relaxed outline-none placeholder:text-secondary-text/50"
            />

            <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
              {/* Ratio chip */}
              <button
                onClick={() => setOpenPanel(openPanel === "ratio" ? null : "ratio")}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                  openPanel === "ratio"
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-glass-border text-secondary-text hover:text-primary-text"
                }`}
              >
                <FiMaximize2 className="text-[10px]" />
                {aspectRatio.label}
              </button>

              {/* Resolution segmented */}
              <div className="flex rounded-lg border border-glass-border p-0.5">
                {RESOLUTIONS.map((res) => (
                  <button
                    key={res.value}
                    onClick={() => setResolution(res)}
                    className={`relative rounded-md px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${
                      resolution.value === res.value
                        ? "text-primary-btn-text"
                        : "text-secondary-text hover:text-primary-text"
                    }`}
                  >
                    {resolution.value === res.value && (
                      <motion.span
                        layoutId="res-pill"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-md bg-primary"
                      />
                    )}
                    <span className="relative">{res.value}</span>
                  </button>
                ))}
              </div>

              {/* Refs chip (edit mode) */}
              {mode === "edit" && (
                <button
                  onClick={() => setOpenPanel(openPanel === "refs" ? null : "refs")}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                    imagesList.length > 0
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-glass-border text-secondary-text hover:text-primary-text"
                  }`}
                >
                  <FiImage className="text-[10px]" />
                  {imagesList.length > 0 ? `${imagesList.length} refs` : "Add refs"}
                </button>
              )}

              {/* Web search toggle */}
              <button
                onClick={() => setGoogleSearch(!googleSearch)}
                title="Ground the render in live web search"
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                  googleSearch
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-glass-border text-secondary-text hover:text-primary-text"
                }`}
              >
                <FiSearch className="text-[10px]" />
                Web
              </button>

              <div className="flex-1" />

              {/* Generate */}
              <motion.button
                onClick={handleGenerate}
                disabled={!canGenerate}
                whileHover={canGenerate ? { scale: 1.04 } : {}}
                whileTap={canGenerate ? { scale: 0.96 } : {}}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-primary-btn-text shadow-lg shadow-primary/25 disabled:opacity-40 disabled:shadow-none"
              >
                <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
                {loading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <FiZap />
                )}
                <span className="relative hidden sm:inline">
                  {loading ? "Rendering" : `Render · ${resolution.cost} cr`}
                </span>
                <span className="relative sm:hidden">{resolution.cost} cr</span>
              </motion.button>
            </div>
          </motion.div>

          <p className="mt-2 text-center text-[10px] text-secondary-text/60">
            Enter to render · Shift+Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
}

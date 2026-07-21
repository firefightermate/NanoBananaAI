"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import {
  FaBolt,
  FaMagic,
  FaSearch,
  FaChevronDown,
  FaExpand,
  FaPlus,
  FaTrash,
  FaSyncAlt,
} from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { downloadImage } from "@/lib/utils";
import Aurora from "@/components/landing/Aurora";

const ASPECT_RATIOS = [
  { label: "1:1 Square", value: "1:1" },
  { label: "16:9 Landscape", value: "16:9" },
  { label: "9:16 Portrait", value: "9:16" },
  { label: "4:3 Classic", value: "4:3" },
  { label: "3:4 Classic", value: "3:4" },
  { label: "3:2 Photo", value: "3:2" },
  { label: "2:3 Photo", value: "2:3" },
  { label: "21:9 UltraWide", value: "21:9" },
  { label: "9:21 UltraPortrait", value: "9:21" },
  { label: "4:5 Portrait", value: "4:5" },
  { label: "5:4 Portrait", value: "5:4" },
  { label: "Auto Detect", value: "Auto" },
];

const RESOLUTIONS = [
  { value: "1k", cost: 12 },
  { value: "2k", cost: 18 },
  { value: "4k", cost: 24 },
];

const IDEAS = [
  "A liquid chrome banana orbiting a black hole, cinematic rim light",
  "Rainy Tokyo alley at midnight, neon reflections, 35mm film grain",
  "Matte black bottle on wet stone, studio softbox, product hero",
  "Vintage travel poster for the moons of Jupiter, screenprint texture",
];

const STATUS_LINES = [
  "Reading the prompt…",
  "Composing the frame…",
  "Diffusing pixels…",
  "Sharpening detail…",
];

export default function Create() {
  const { data: session } = useSession();

  const [mode, setMode] = useState("generate");

  const [isRatioOpen, setIsRatioOpen] = useState(false);
  const ratioRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [googleSearch, setGoogleSearch] = useState(false);
  const [imagesList, setImagesList] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ratioRef.current && !ratioRef.current.contains(event.target)) {
        setIsRatioOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setAspectRatio(
      mode === "edit"
        ? ASPECT_RATIOS.find((r) => r.value === "Auto") || ASPECT_RATIOS[0]
        : ASPECT_RATIOS[0],
    );
  }, [mode]);

  // Cycle the status copy while a job is in flight.
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(
      () => setStatusIndex((i) => (i + 1) % STATUS_LINES.length),
      2200,
    );
    return () => clearInterval(id);
  }, [loading]);

  const addImageToList = () => {
    if (newImageUrl && imagesList.length < 14) {
      setImagesList([...imagesList, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload only PNG, JPG, or JPEG images.");
      return;
    }

    if (!session) {
      signIn();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
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
        setImagesList([...imagesList, data.url]);
      }
    } catch (err) {
      setError("Failed to upload image. Try a URL instead.");
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImageFromList = (index) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!session) {
      signIn();
      return;
    }

    if (mode === "generate" && !prompt.trim()) return;
    if (mode === "edit" && imagesList.length === 0) {
      setError("Add at least one reference image to edit.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultUrl(null);
      setStatusIndex(0);

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

      await pollStatus(data.request_id, data.metadata);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.error(err);
      setLoading(false);
    }
  };

  const pollStatus = async (requestId, metadata) => {
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
        setLoading(false);
      } else if (data.status === "failed") {
        throw new Error(data.error || "Generation failed.");
      } else {
        setTimeout(() => pollStatus(requestId, metadata), 3000);
      }
    } catch (err) {
      setError(err.message || "An error occurred while checking status.");
      setLoading(false);
    }
  };

  const disabled =
    loading ||
    (mode === "generate" && !prompt.trim()) ||
    (mode === "edit" && imagesList.length === 0);

  return (
    <div className="flex flex-1 flex-col-reverse lg:h-[calc(100dvh-69px)] lg:flex-row lg:overflow-hidden">
      {/* Controls */}
      <aside className="flex w-full shrink-0 flex-col border-glass-border bg-glass-bg backdrop-blur-2xl lg:h-full lg:w-96 lg:overflow-y-auto lg:border-r custom-scrollbar">
        <div className="space-y-5 border-b border-glass-border p-6">
          <div>
            <h2 className="text-lg font-black tracking-tight">Studio</h2>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary-text">
              nano banana engine
            </p>
          </div>

          <div className="flex rounded-lg border border-glass-border bg-glass-hover p-1">
            {[
              { id: "generate", label: "Generate", Icon: FaMagic },
              { id: "edit", label: "Edit", Icon: FaSyncAlt },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  mode === id ? "text-primary-btn-text" : "text-secondary-text hover:text-primary-text"
                }`}
              >
                {mode === id && (
                  <motion.span
                    layoutId="mode-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-md bg-primary"
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className="text-xs" />
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-5 p-6">
          {/* Prompt */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold">
              <span className="h-1 w-1 rounded-full bg-primary" />
              {mode === "generate" ? "Prompt" : "What should change?"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === "generate"
                  ? "A cybernetic banana drifting through a nebula…"
                  : "Make the jacket vintage leather and light it at golden hour…"
              }
              className="h-32 w-full resize-none rounded-lg border border-glass-border bg-bg-page/60 p-3 text-sm transition-colors placeholder:text-secondary-text/60 focus:border-primary/50 focus:outline-none"
            />
            {mode === "generate" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {IDEAS.slice(0, 2).map((idea) => (
                  <button
                    key={idea}
                    onClick={() => setPrompt(idea)}
                    className="truncate rounded-md border border-glass-border bg-glass-hover px-2 py-1 text-[10px] text-secondary-text transition-colors hover:text-primary-text"
                  >
                    {idea.slice(0, 34)}…
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reference images */}
          {mode === "edit" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 overflow-hidden"
            >
              <label className="flex items-center gap-2 text-xs font-semibold">
                <span className="h-1 w-1 rounded-full bg-primary" />
                References ({imagesList.length}/14)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste an image URL…"
                  className="flex-1 rounded-lg border border-glass-border bg-bg-page/60 px-3 py-2 text-[11px] outline-none focus:border-primary/50"
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
                  title="Upload a file"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-btn-text disabled:opacity-40"
                >
                  {isUploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <FaPlus />
                  )}
                </button>
                <button
                  onClick={addImageToList}
                  disabled={!newImageUrl || imagesList.length >= 14}
                  title="Add URL"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-btn-text disabled:opacity-40"
                >
                  <FaPlus />
                </button>
              </div>

              {imagesList.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {imagesList.map((url, idx) => (
                    <motion.div
                      key={url + idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-glass-border"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImageFromList(idx)}
                        className="absolute right-1 top-1 rounded-md bg-red-500/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <FaTrash className="text-[10px]" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Aspect ratio */}
          <div className="space-y-2" ref={ratioRef}>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Aspect ratio
            </label>
            <div className="relative">
              <button
                onClick={() => setIsRatioOpen(!isRatioOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-glass-border bg-bg-page/60 p-3 text-xs font-semibold transition-colors hover:bg-glass-hover"
              >
                <span className="flex items-center gap-3">
                  <FaExpand className="text-primary" />
                  {aspectRatio.label}
                </span>
                <FaChevronDown
                  className={`text-[10px] transition-transform duration-300 ${isRatioOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isRatioOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="glass-dropdown custom-scrollbar absolute left-0 right-0 top-12 z-[100] max-h-60 overflow-y-auto rounded-lg p-1 shadow-2xl"
                  >
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => {
                          setAspectRatio(ratio);
                          setIsRatioOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-md p-2.5 text-left text-[11px] font-semibold transition-colors ${
                          aspectRatio.value === ratio.value
                            ? "bg-primary text-primary-btn-text"
                            : "text-secondary-text hover:bg-glass-hover hover:text-primary-text"
                        }`}
                      >
                        <span
                          className={`h-3 w-3 rounded-sm border ${
                            aspectRatio.value === ratio.value
                              ? "border-current"
                              : "border-divider"
                          }`}
                        />
                        {ratio.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Resolution
            </label>
            <div className="flex gap-2">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res.value}
                  onClick={() => setResolution(res)}
                  className={`flex flex-1 flex-col items-center rounded-lg border py-3 transition-colors ${
                    resolution.value === res.value
                      ? "border-primary/50 bg-primary text-primary-btn-text"
                      : "border-glass-border bg-bg-page/60 text-secondary-text hover:text-primary-text"
                  }`}
                >
                  <span className="text-sm font-bold uppercase">{res.value}</span>
                  <span className="mt-0.5 text-[10px] opacity-80">{res.cost} cr</span>
                </button>
              ))}
            </div>
          </div>

          {/* Web search */}
          <button
            onClick={() => setGoogleSearch(!googleSearch)}
            className={`flex w-full items-center justify-between rounded-lg border p-3 transition-colors ${
              googleSearch
                ? "border-primary/50 bg-primary text-primary-btn-text"
                : "border-glass-border bg-bg-page/60 text-secondary-text hover:text-primary-text"
            }`}
          >
            <span className="flex items-center gap-3">
              <FaSearch className="text-xs" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Smart search
              </span>
            </span>
            <span
              className={`relative flex h-4 w-8 items-center rounded-full ${
                googleSearch ? "bg-black/25" : "border border-glass-border bg-bg-page"
              }`}
            >
              <motion.span
                animate={{ x: googleSearch ? 16 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute h-2.5 w-2.5 rounded-full bg-white"
              />
            </span>
          </button>
        </div>

        <div className="border-t border-glass-border p-6">
          <button
            onClick={handleGenerate}
            disabled={disabled}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-lg bg-primary py-3.5 text-xs font-black uppercase tracking-wider text-primary-btn-text transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FaBolt />
            )}
            {loading ? "Rendering…" : `Generate · ${resolution.cost} credits`}
          </button>
        </div>
      </aside>

      {/* Canvas */}
      <main className="relative flex min-h-[55vh] flex-1 flex-col overflow-hidden lg:min-h-0">
        <Aurora />

        <div className="custom-scrollbar relative z-10 flex flex-1 items-center justify-center overflow-y-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {!resultUrl && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-md space-y-7 text-center"
              >
                <div className="relative mx-auto h-24 w-24">
                  <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl" />
                  <div className="relative flex h-full w-full rotate-3 items-center justify-center rounded-3xl border border-glass-border bg-glass-bg">
                    <FaMagic className="text-2xl text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight">
                    {mode === "generate" ? "Describe something." : "Drop something in."}
                  </h2>
                  <p className="text-sm text-secondary-text">
                    {mode === "generate"
                      ? "The more specific the sentence, the closer the frame."
                      : "Add references, then say what should change."}
                  </p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-10"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="h-40 w-40 rounded-full border-2 border-glass-border border-t-primary"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-6 rounded-full border border-glass-border border-b-[var(--accent)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaBolt className="animate-pulse text-xl text-primary" />
                  </div>
                </div>

                <div className="space-y-3 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={statusIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-lg font-bold tracking-tight"
                    >
                      {STATUS_LINES[statusIndex]}
                    </motion.div>
                  </AnimatePresence>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary-text">
                    {resolution.value} · {aspectRatio.label}
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-sm space-y-3 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                  Something broke
                </div>
                <p className="text-sm leading-relaxed text-secondary-text">
                  {typeof error === "string" ? error : "Request failed. Check your credits."}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="rounded-full border border-glass-border px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-glass-hover"
                >
                  Dismiss
                </button>
              </motion.div>
            )}

            {resultUrl && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-glass-border shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
              >
                <img src={resultUrl} alt={prompt} className="h-auto max-h-[75vh] w-auto" />

                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0 space-y-2">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {prompt || "Untitled"}
                      </h3>
                      <div className="flex gap-2">
                        {[aspectRatio.label, resolution.value.toUpperCase()].map((chip) => (
                          <span
                            key={chip}
                            className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        setDownloading(true);
                        await downloadImage(resultUrl, `nano-banana-${Date.now()}.jpg`);
                        setDownloading(false);
                      }}
                      disabled={downloading}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {downloading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      ) : (
                        <FiDownload />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

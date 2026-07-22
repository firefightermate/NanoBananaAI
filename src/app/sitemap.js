const BASE = "https://kalium-one.vercel.app";

export default function sitemap() {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/create`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/gallery`, changeFrequency: "monthly", priority: 0.5 },
  ];
}

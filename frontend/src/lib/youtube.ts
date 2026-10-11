export function getYouTubeVideoId(rawUrl: string): string | null {
  if (/^[\w-]{11}$/.test(rawUrl.trim())) return rawUrl.trim();
  try {
    const url = new URL(rawUrl.trim());
    if (url.protocol !== "https:") return null;

    let videoId: string | null = null;
    if (url.hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v");
      else if (/^\/(embed|shorts|live)\//.test(url.pathname)) videoId = url.pathname.split("/")[2] ?? null;
    }

    return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(rawUrl: string): string | null {
  const videoId = getYouTubeVideoId(rawUrl);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}

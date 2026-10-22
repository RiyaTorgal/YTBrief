// All Flask communication lives here (routes are implemented in ytBrief_Backend/app.py).
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type SummaryType = "quick" | "detailed" | "key-points" | "chapters";
export type Lang = "en" | "es" | "fr";

export interface VideoMeta {
  id: string; title: string; channel: string; duration: string;
  views: string; thumbnail: string; url: string;
  chapters: { title: string; start: string }[];
}
export interface SummaryRequest {
  url: string; language: Lang; type: SummaryType; chapters: "all" | number[];
}
export interface Summary {
  id: string; video: VideoMeta; tldr: string; takeaways: string[];
  detailed: string; chapterSummaries: { title: string; text: string }[];
  language: Lang; type: SummaryType; createdAt: string;
}

export type ApiErrorCode =
  | "invalid_url" | "video_unavailable" | "transcript_unavailable"
  | "gemini_error" | "api_error" | "network_error";

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message: string) { super(message); }
}
export const friendlyErrors: Record<ApiErrorCode, string> = {
  invalid_url: "That doesn't look like a YouTube link. Check the URL and try again.",
  video_unavailable: "This video is private, removed or unavailable.",
  transcript_unavailable: "This video has no transcript we can read.",
  gemini_error: "The AI couldn't summarize this video right now. Please retry.",
  api_error: "Something went wrong on our side. Please try again.",
  network_error: "Can't reach the server. Check your connection.",
};

export function isYouTubeUrl(v: string) {
  return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}/.test(v.trim());
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init, headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch { throw new ApiError("network_error", friendlyErrors.network_error); }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = (body.code as ApiErrorCode) ?? "api_error";
    throw new ApiError(code, friendlyErrors[code] ?? friendlyErrors.api_error);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const getVideoMeta = (url: string) =>
  request<VideoMeta>("/api/video-meta", { method: "POST", body: JSON.stringify({ url }) });
export const generateSummary = (req: SummaryRequest) =>
  request<Summary>("/api/summarize", { method: "POST", body: JSON.stringify(req) });
export const listSummaries = () => request<Summary[]>("/api/files");
export const getSummary = (id: string) => request<Summary>(`/api/files/${id}`);
export const deleteSummary = (id: string) => request<void>(`/api/files/${id}`, { method: "DELETE" });

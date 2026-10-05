import type { FileUIPart } from "ai";

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode failed"));
    image.src = url;
  });
}

/** Shrinks photos in the browser so analysis is fast and chat history stays light. */
export async function prepareImageAttachment(file: FileUIPart): Promise<FileUIPart> {
  if (!file.mediaType?.startsWith("image/") || typeof document === "undefined") return file;
  try {
    const image = await loadImage(file.url);
    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const url = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const baseName = (file.filename ?? "photo").replace(/\.[^.]+$/, "");
    return { ...file, url, mediaType: "image/jpeg", filename: `${baseName}.jpg` };
  } catch {
    // Formats the browser cannot decode (e.g. HEIC) are sent as-is if small enough; the server re-checks size.
    return file;
  }
}

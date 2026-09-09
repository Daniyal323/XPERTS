/**
 * Client-side image compression.
 *
 * The project runs on Firebase's free Spark plan, which does NOT include Cloud
 * Storage. Instead of uploading binaries, we downscale + JPEG-compress the
 * image in the browser to a small data URL that is stored directly on the
 * Firestore user document. A 256px avatar lands around 15–40 KB — well within
 * Firestore's 1 MB document limit.
 */
export async function compressImageToDataUrl(
  file: File,
  maxSize = 256,
  quality = 0.82,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close?.();
  }
}

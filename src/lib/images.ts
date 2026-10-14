import sharp from "sharp";
export const MAX_BYTES = 6 * 1024 * 1024;
const sniff = (b: Buffer) =>
  (b[0] === 0xff && b[1] === 0xd8) ? "jpeg" :
  (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ? "png" :
  (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") ? "webp" : null;
/** Validates real file content (not the client-declared type), strips metadata (incl. GPS), resizes, re-encodes to WebP. */
export async function processImage(file: File): Promise<Buffer> {
  if (file.size === 0 || file.size > MAX_BYTES) throw new Error("Each image must be under 6 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  if (!sniff(buf)) throw new Error("Only JPEG, PNG or WebP images are allowed.");
  return sharp(buf, { limitInputPixels: 60_000_000 }).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(); // no withMetadata => EXIF removed
}

/** Full-size (2000px) plus an 800px thumbnail for cards and grids. */
export async function processImageSet(file: File) {
  const full = await processImage(file);
  const small = await sharp(full).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
  return { full, small };
}

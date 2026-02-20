/**
 * Compress all images in public/photos to WebP (quality 90, max 1920px).
 * Greatly reduces deployment size while keeping quality high.
 * Run: pnpm run compress-photos
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.join(__dirname, "..", "public", "photos");

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 90;
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)$/i;

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Run: pnpm add -D sharp");
    process.exit(1);
  }

  if (!fs.existsSync(PHOTOS_DIR)) {
    console.log("No public/photos folder found.");
    return;
  }

  const files = fs.readdirSync(PHOTOS_DIR).filter((f) => IMAGE_EXT.test(f));
  if (files.length === 0) {
    console.log("No images to compress in public/photos.");
    return;
  }

  console.log(`Found ${files.length} image(s). Compressing to WebP (max ${MAX_WIDTH}px, quality ${WEBP_QUALITY})...\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const inputPath = path.join(PHOTOS_DIR, file);
    const outputPath = path.join(PHOTOS_DIR, `${base}.webp`);

    try {
      const stat = fs.statSync(inputPath);
      totalBefore += stat.size;

      const pipeline = sharp(inputPath)
        .rotate() // respect EXIF orientation
        .resize(MAX_WIDTH, MAX_WIDTH, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 6 });

      const isSameFile = path.resolve(inputPath) === path.resolve(outputPath);
      const outPath = isSameFile ? path.join(PHOTOS_DIR, `${base}.tmp.webp`) : outputPath;
      await pipeline.toFile(outPath);
      const outStat = fs.statSync(outPath);
      totalAfter += outStat.size;

      const pct = stat.size > 0 ? Math.round((1 - outStat.size / stat.size) * 100) : 0;
      console.log(`  ${file} → ${base}.webp  (${(stat.size / 1024).toFixed(0)} KB → ${(outStat.size / 1024).toFixed(0)} KB, -${pct}%)`);

      if (isSameFile) {
        fs.renameSync(outPath, outputPath);
      } else {
        fs.unlinkSync(inputPath);
      }
    } catch (err) {
      console.error(`  ${file}: ${err.message}`);
    }
  }

  const saved = totalBefore - totalAfter;
  const pct = totalBefore > 0 ? Math.round((saved / totalBefore) * 100) : 0;
  console.log(`\nDone. Total: ${(totalBefore / 1024 / 1024).toFixed(2)} MB → ${(totalAfter / 1024 / 1024).toFixed(2)} MB (saved ${(saved / 1024 / 1024).toFixed(2)} MB, -${pct}%).`);
}

main();

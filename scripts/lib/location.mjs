// Checks for files that would reveal where they were made. Shared by scripts/media.mjs and the pre-commit hook.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import exifReader from 'exif-reader';

export const PHOTO = /\.(jpe?g|png|webp|tiff?|heic|heif|avif)$/i;
export const VIDEO = /\.(mp4|m4v|mov)$/i;

/** Why a file might reveal a location, or null. Anything unreadable counts as unsafe. */
export async function locationIn(file) {
  if (PHOTO.test(file)) return photoLocation(file);
  if (VIDEO.test(file)) return videoLocation(file);
  return null;
}

/** Why a photo might reveal where it was taken, or null. Anything unreadable counts as unsafe. */
export async function photoLocation(file) {
  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch (e) {
    return `couldn't read it to check: ${e.message}`;
  }
  if (meta.exif) {
    try {
      const gps = exifReader(meta.exif).GPSInfo;
      if (gps && Object.keys(gps).some((k) => /Latitude|Longitude/.test(k))) return 'GPS in EXIF';
    } catch {
      return "couldn't parse its EXIF to check";
    }
  }
  if (meta.xmp && /GPS(Latitude|Longitude)|LocationShown|LocationCreated/.test(meta.xmp.toString('utf8'))) return 'location in XMP';
  return null;
}

/** MP4/MOV store location in a "©xyz" atom (QuickTime) or com.apple.quicktime.location.ISO6709 key. */
export async function videoLocation(file) {
  const buf = await fs.readFile(file);
  if (buf.includes(Buffer.from([0xa9, 0x78, 0x79, 0x7a]))) return '©xyz location atom';
  if (buf.includes(Buffer.from('com.apple.quicktime.location'))) return 'Apple location metadata';
  return null;
}

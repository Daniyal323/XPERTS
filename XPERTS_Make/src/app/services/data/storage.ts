import { compressImageToDataUrl } from "../../lib/image";

/**
 * Profile media handling.
 *
 * NOTE: the project runs on the free Spark plan (no Cloud Storage), so these
 * do not upload to a bucket — they compress the image client-side and return a
 * small data URL that is stored on the Firestore user document. If the project
 * is later upgraded to Blaze, swap these for real Storage uploads.
 */

/** Avatar / profile photo for a user. */
export function uploadAvatar(file: File): Promise<string> {
  return compressImageToDataUrl(file, 256, 0.82);
}

/** Company logo for an SME. */
export function uploadCompanyLogo(file: File): Promise<string> {
  return compressImageToDataUrl(file, 256, 0.85);
}

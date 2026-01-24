/**
 * Email configuration constants
 */

/** Email address to receive application notifications */
export const ADMIN_EMAIL = 'josroossien@hotmail.com';

/** Email address shown as sender */
export const FROM_EMAIL = 'DSTRCT <noreply@jroossien.com>';

/** Company name for email templates */
export const COMPANY_NAME = 'DSTRCT';

/** Maximum file size for photo uploads (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const;

/** Allowed file extensions for display */
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'] as const;

/** Rate limit: maximum applications per IP per day */
export const MAX_APPLICATIONS_PER_DAY = 3;

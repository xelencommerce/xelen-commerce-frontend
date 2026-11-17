import { MAX_DOCUMENT_BYTES } from '../constants/signup';
import type { DocumentMetadata } from '../types/signup';

export function validateDocument(file: DocumentMetadata): string | undefined {
  if (file.size > MAX_DOCUMENT_BYTES)
    return 'File is larger than 10 MB. Upload a smaller file.';
  if (file.size === 0) return 'This file is empty. Choose another file.';
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeByExtension: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  const expectedMime = extension ? mimeByExtension[extension] : undefined;
  if (!expectedMime || (file.type && file.type !== expectedMime))
    return 'Choose a PDF, JPG or PNG file.';
  return undefined;
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 KB';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

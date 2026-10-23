import crypto from 'crypto';

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes
export const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"

export interface ValidatedResume {
  buffer: Buffer;
  sizeBytes: number;
  sanitizedOriginalName: string;
  storagePath: string;
}

export interface ResumeValidationError {
  code: 'EMPTY_FILE' | 'OVERSIZED' | 'INVALID_SIGNATURE' | 'INVALID_NAME';
  message: string;
}

/**
 * Validates candidate PDF file buffer on the server.
 * Checks file length and verified magic-byte signature.
 * Filenames and client MIME types are NEVER trusted as proof of authenticity.
 */
export function validateResumeBuffer(
  buffer: Buffer,
  originalFilename: string,
  jobId: string,
  applicationId: string
): { success: true; data: ValidatedResume } | { success: false; error: ResumeValidationError } {
  // 1. Check for empty file
  if (!buffer || buffer.length === 0) {
    return {
      success: false,
      error: {
        code: 'EMPTY_FILE',
        message: 'The uploaded resume file is empty.',
      },
    };
  }

  // 2. Enforce 5 MB limit
  if (buffer.length > MAX_RESUME_SIZE_BYTES) {
    return {
      success: false,
      error: {
        code: 'OVERSIZED',
        message: `Resume file exceeds the maximum allowed limit of 5 MB (Received ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`,
      },
    };
  }

  // 3. Verify magic bytes (%PDF-) at offset 0
  if (buffer.length < 5 || !buffer.subarray(0, 5).equals(PDF_MAGIC_BYTES)) {
    return {
      success: false,
      error: {
        code: 'INVALID_SIGNATURE',
        message: 'Invalid file format. Only genuine PDF documents (%PDF-) are accepted.',
      },
    };
  }

  // 4. Sanitize original filename (strip directory traversal, null bytes, and non-printable chars)
  const sanitizedOriginalName = originalFilename
    .replace(/\.{2,}/g, '_')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\0/g, '')
    .trim()
    .slice(0, 150);

  if (!sanitizedOriginalName || sanitizedOriginalName.length < 3) {
    return {
      success: false,
      error: {
        code: 'INVALID_NAME',
        message: 'The resume filename is invalid.',
      },
    };
  }

  // 5. Generate opaque, unguessable storage path
  // Format: resumes/<jobId>/<applicationId>/<randomUUID>.pdf
  const randomFileId = crypto.randomUUID();
  const storagePath = `resumes/${jobId}/${applicationId}/${randomFileId}.pdf`;

  return {
    success: true,
    data: {
      buffer,
      sizeBytes: buffer.length,
      sanitizedOriginalName,
      storagePath,
    },
  };
}

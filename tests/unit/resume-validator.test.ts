import { describe, it, expect } from 'vitest';
import {
  validateResumeBuffer,
  MAX_RESUME_SIZE_BYTES,
  PDF_MAGIC_BYTES,
} from '@/lib/security/resume-validator';

describe('Phase 3: Server-Side Resume PDF Validation', () => {
  const dummyJobId = '22222222-2222-2222-2222-222222222222';
  const dummyAppId = '33333333-3333-3333-3333-333333333333';

  // Helper to create a genuine mock PDF buffer
  function createMockPdfBuffer(sizeBytes: number = 1024): Buffer {
    const buffer = Buffer.alloc(sizeBytes);
    PDF_MAGIC_BYTES.copy(buffer, 0); // Write '%PDF-' at offset 0
    buffer.write('1.7 mock content', 5);
    return buffer;
  }

  it('should accept a genuine PDF buffer within 5 MB', () => {
    const buffer = createMockPdfBuffer(2048);
    const result = validateResumeBuffer(buffer, 'Candidate_Resume.pdf', dummyJobId, dummyAppId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sizeBytes).toBe(2048);
      expect(result.data.sanitizedOriginalName).toBe('Candidate_Resume.pdf');
      expect(result.data.storagePath).toMatch(/^resumes\/22222222-2222-2222-2222-222222222222\/33333333-3333-3333-3333-333333333333\/[a-f0-9-]+\.pdf$/);
    }
  });

  it('should reject an empty 0-byte file buffer with EMPTY_FILE error', () => {
    const emptyBuffer = Buffer.alloc(0);
    const result = validateResumeBuffer(emptyBuffer, 'resume.pdf', dummyJobId, dummyAppId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_FILE');
    }
  });

  it('should reject a file buffer exceeding 5 MB with OVERSIZED error', () => {
    const oversizedBuffer = createMockPdfBuffer(MAX_RESUME_SIZE_BYTES + 1024);
    const result = validateResumeBuffer(oversizedBuffer, 'huge_resume.pdf', dummyJobId, dummyAppId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('OVERSIZED');
      expect(result.error.message).toContain('exceeds the maximum allowed limit of 5 MB');
    }
  });

  it('should reject a fake/malformed PDF (e.g. text or HTML renamed to .pdf) with INVALID_SIGNATURE', () => {
    // Malformed buffer lacking %PDF- signature
    const fakePdfBuffer = Buffer.from('<html><body>Fake resume content</body></html>');
    const result = validateResumeBuffer(fakePdfBuffer, 'resume.pdf', dummyJobId, dummyAppId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_SIGNATURE');
      expect(result.error.message).toContain('Only genuine PDF documents (%PDF-) are accepted');
    }
  });

  it('should sanitize dangerous directory traversal characters from original filenames', () => {
    const buffer = createMockPdfBuffer(512);
    const dangerousFilename = '../../../../etc/passwd_resume.pdf';
    const result = validateResumeBuffer(buffer, dangerousFilename, dummyJobId, dummyAppId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sanitizedOriginalName).not.toContain('..');
      expect(result.data.sanitizedOriginalName).not.toContain('/');
    }
  });

  it('should never trust client-supplied paths and enforce opaque application-scoped paths', () => {
    const buffer = createMockPdfBuffer(512);
    const result = validateResumeBuffer(buffer, 'my_resume.pdf', dummyJobId, dummyAppId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.storagePath.startsWith(`resumes/${dummyJobId}/${dummyAppId}/`)).toBe(true);
      expect(result.data.storagePath.endsWith('.pdf')).toBe(true);
    }
  });
});

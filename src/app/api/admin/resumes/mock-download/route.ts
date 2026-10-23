import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminProfile } from '@/lib/auth/admin-auth';
import { getMockApplications } from '@/lib/data/mock-data';

export async function GET(request: NextRequest) {
  // Enforce server-side active admin authorization
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return new NextResponse('Unauthorized: Active admin authentication required', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get('applicationId');
  const token = searchParams.get('token');

  if (!applicationId || !token) {
    return new NextResponse('Bad Request: Missing parameters', { status: 400 });
  }

  // Verify token expiry
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [adminId, expiresAtStr] = decoded.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (adminId !== admin.id || Date.now() > expiresAt) {
      return new NextResponse('Forbidden: Signed URL has expired or is invalid', { status: 403 });
    }
  } catch {
    return new NextResponse('Forbidden: Invalid token signature', { status: 403 });
  }

  const app = getMockApplications().find((a) => a.id === applicationId);
  if (!app) {
    return new NextResponse('Not Found: Candidate application does not exist', { status: 404 });
  }

  // Construct minimal valid PDF bytes
  const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 55 >> stream
BT /F1 12 Tf 72 712 Td (Akshitha Edutech - Resume Document) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000216 00000 n 
trailer << /Root 1 0 R /Size 5 >>
startxref
322
%%EOF`;

  const fileName = app.resume_original_name || 'candidate_resume.pdf';

  return new NextResponse(pdfContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    },
  });
}

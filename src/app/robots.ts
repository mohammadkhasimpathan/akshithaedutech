import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.akshithaedutech.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/jobs', '/resources', '/contact'],
        disallow: ['/admin/', '/admin', '/api/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

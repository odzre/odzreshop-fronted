import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? '';

  try {
    const [gamesRes, blogsRes] = await Promise.all([
      fetch(`${apiBase}/api/games`, {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json',
        },
      }),
      fetch(`${apiBase}/api/blogs`, {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json',
        },
      }),
    ]);

    if (!gamesRes.ok || !blogsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
    }

    const gamesData = await gamesRes.json();
    const blogsData = await blogsRes.json();

    const games = gamesData?.games || [];
    const blogs = blogsData?.blogs || [];

    const urls = [
      { loc: `${baseUrl}/`, lastmod: new Date().toISOString() },
      { loc: `${baseUrl}/partnership`, lastmod: new Date().toISOString() },
      ...games.map((game: any) => ({
        loc: `${baseUrl}/order/${game.slug}`,
        lastmod: game.updated_at,
      })),
      ...blogs.map((blog: any) => ({
        loc: `${baseUrl}/artikel/${blog.slug}`,
        lastmod: blog.published_at,
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// api/sitemap.js - Génère dynamiquement le sitemap avec toutes les missions
exports.handler = async (event, context) => {
  try {
    // Récupérer les missions via l'API REST de Supabase
    const response = await fetch(
      `${process.env.VITE_SUPABASE_URL}/rest/v1/jobs?select=slug,updated_at&order=created_at.desc`,
      {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des jobs');
    }

    const jobs = await response.json();

    // Date actuelle pour les pages statiques
    const currentDate = new Date().toISOString().split('T')[0];

    // Construire le XML du sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Pages statiques -->
  <url>
    <loc>https://manouvellemission.com/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>https://manouvellemission.com/missions</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://manouvellemission.com/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Pages dynamiques des missions -->
  ${jobs.map(job => `
  <url>
    <loc>https://manouvellemission.com/mission/${job.slug}</loc>
    <lastmod>${job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    // Retourner la réponse
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      },
      body: sitemap
    };
    
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    
    // En cas d'erreur, retourner un sitemap minimal
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://manouvellemission.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml'
      },
      body: fallbackSitemap
    };
  }
};

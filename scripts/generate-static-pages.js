// scripts/generate-static-pages.js
// Script à exécuter lors du build Netlify pour générer des pages statiques

import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Supabase - utilise les variables d'environnement Netlify
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Configuration du script de génération:');
console.log('- SUPABASE_URL:', SUPABASE_URL ? '✅ Configuré' : '❌ Manquant');
console.log('- SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Configuré' : '❌ Manquant');

// Données de fallback si Supabase n'est pas configuré
const FALLBACK_JOBS = [
  {
    id: 1,
    title: "Développeur Full Stack React/Node.js",
    company: "TechCorp Innovation",
    location: "Paris",
    type: "Mission",
    salary: "650",
    salary_type: "TJM",
    description: "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe sur un projet innovant de plateforme e-commerce. Vous travaillerez sur le développement d'une application web moderne utilisant React pour le frontend et Node.js pour le backend, avec une base de données PostgreSQL.",
    requirements: [
      "5+ années d'expérience en développement web",
      "Maîtrise de React et de l'écosystème JavaScript moderne",
      "Expérience avec Node.js et Express",
      "Connaissance de PostgreSQL et des ORM (Prisma, Sequelize)",
      "Familiarité avec Git et les méthodologies Agile"
    ],
    benefits: [
      "Télétravail partiel (3 jours/semaine)",
      "Mutuelle d'entreprise prise en charge à 100%",
      "Formation continue et budget formation",
      "Équipement informatique fourni"
    ],
    posted_date: new Date().toISOString().split('T')[0],
    applicants: 12,
    featured: true,
    slug: "developpeur-full-stack-react-nodejs-paris"
  },
  {
    id: 2,
    title: "Expert Cybersécurité",
    company: "SecureIT Solutions",
    location: "Lyon",
    type: "CDI",
    salary: "65K-75K",
    salary_type: "Annuel",
    description: "Rejoignez notre équipe de cybersécurité en tant qu'expert pour protéger nos infrastructures et celles de nos clients. Vous serez responsable de l'analyse des menaces, de la mise en place de solutions de sécurité, et de la formation des équipes aux bonnes pratiques.",
    requirements: [
      "Master en cybersécurité ou équivalent",
      "Certifications CISSP, CEH ou équivalent",
      "Expérience avec les outils SIEM",
      "Connaissance des frameworks de sécurité (ISO 27001, NIST)"
    ],
    benefits: [
      "CDI avec période d'essai de 3 mois",
      "13ème mois + prime de performance",
      "Formation certifiante prise en charge",
      "Télétravail 2 jours/semaine"
    ],
    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicants: 8,
    featured: false,
    slug: "expert-cybersecurite-lyon"
  }
];

// Fonction pour générer le slug
function generateSlug(title, location) {
  return `${title}-${location}`
    .toLowerCase()
    .replace(/[àáäâ]/g, 'a')
    .replace(/[èéëê]/g, 'e')
    .replace(/[ìíïî]/g, 'i')
    .replace(/[òóöô]/g, 'o')
    .replace(/[ùúüû]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Récupérer les jobs depuis Supabase
async function fetchJobs() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️  Variables Supabase manquantes - Utilisation des données de fallback');
    return FALLBACK_JOBS;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs?order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.length > 0 ? data : FALLBACK_JOBS;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des jobs:', error.message);
    console.log('📦 Utilisation des données de fallback');
    return FALLBACK_JOBS;
  }
}

// Template HTML pour une page de job
function generateJobPageHTML(job) {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "Ma Nouvelle Mission",
      "value": job.id
    },
    "datePosted": job.posted_date || new Date().toISOString().split('T')[0],
    "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "employmentType": job.type === "CDI" ? "FULL_TIME" : "CONTRACTOR",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "sameAs": "https://manouvellemission.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location.split(',')[0],
        "addressCountry": "FR"
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "EUR",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary,
        "unitText": job.salary_type === "TJM" ? "DAY" : "YEAR"
      }
    }
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    
    <!-- SEO Optimisé pour cette offre -->
    <title>${job.title} - ${job.company} | ${job.location} - Ma Nouvelle Mission</title>
    <meta name="description" content="${job.title} chez ${job.company} à ${job.location}. ${job.description.substring(0, 150)}... TJM: ${job.salary}€. Postulez maintenant!">
    <meta name="keywords" content="${job.title}, ${job.company}, ${job.location}, emploi IT, mission freelance, ${job.type}, TJM ${job.salary}">
    
    <!-- URL Canonique -->
    <link rel="canonical" href="https://manouvellemission.com/jobs/${job.slug || generateSlug(job.title, job.location)}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${job.title} - ${job.company}" />
    <meta property="og:description" content="${job.description.substring(0, 150)}..." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://manouvellemission.com/jobs/${job.slug || generateSlug(job.title, job.location)}" />
    <meta property="og:image" content="https://i.postimg.cc/gw453gDP/Manouvellemission.png" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${job.title} - ${job.company}" />
    <meta name="twitter:description" content="${job.description.substring(0, 150)}..." />
    
    <!-- Structured Data pour Google Jobs -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
    
    <link rel="icon" type="image/png" href="https://i.postimg.cc/gw453gDP/Manouvellemission.png">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1rem 0; }
        .logo { height: 2.5rem; }
        .main { padding: 2rem 0; }
        .job-header { background: #f8fafc; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem; }
        .job-title { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
        .job-company { font-size: 1.25rem; color: #4f46e5; margin-bottom: 0.5rem; }
        .job-meta { display: flex; gap: 1rem; flex-wrap: wrap; color: #6b7280; }
        .job-salary { font-size: 1.5rem; font-weight: bold; color: #059669; }
        .section { margin-bottom: 2rem; }
        .section h2 { font-size: 1.5rem; margin-bottom: 1rem; }
        .requirements, .benefits { list-style: none; padding: 0; }
        .requirements li, .benefits li { padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
        .requirements li:before { content: "✓ "; color: #059669; font-weight: bold; }
        .benefits li:before { content: "✨ "; }
        .cta { background: #dbeafe; padding: 2rem; border-radius: 0.5rem; text-align: center; }
        .btn { background: #4f46e5; color: white; padding: 0.75rem 2rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; }
        .footer { background: #1f2937; color: white; padding: 2rem 0; text-align: center; }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <a href="/" style="display: flex; align-items: center;">
                    <img src="https://i.postimg.cc/gw453gDP/Manouvellemission.png" alt="Ma Nouvelle Mission" class="logo" />
                </a>
                <nav style="display: flex; gap: 2rem;">
                    <a href="/" style="text-decoration: none; color: #374151;">Accueil</a>
                    <a href="/#jobs" style="text-decoration: none; color: #374151;">Toutes les missions</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Contenu principal -->
    <main class="main">
        <div class="container">
            <article>
                <div class="job-header">
                    <h1 class="job-title">${job.title}</h1>
                    <p class="job-company">${job.company}</p>
                    <div class="job-meta">
                        <span>📍 ${job.location}</span>
                        <span>💼 ${job.type}</span>
                        <span class="job-salary">
                            ${job.salary_type === 'TJM' ? `${job.salary}€/jour` : `${job.salary}€/an`}
                        </span>
                    </div>
                </div>

                <div class="section">
                    <h2>Description du poste</h2>
                    <p style="white-space: pre-line;">${job.description}</p>
                </div>

                ${job.requirements && job.requirements.length > 0 ? `
                <div class="section">
                    <h2>Compétences requises</h2>
                    <ul class="requirements">
                        ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${job.benefits && job.benefits.length > 0 ? `
                <div class="section">
                    <h2>Avantages</h2>
                    <ul class="benefits">
                        ${job.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                <div class="cta">
                    <h2>Intéressé(e) par cette mission ?</h2>
                    <a href="https://manouvellemission.com/?job=${job.id}" class="btn">
                        Postuler maintenant
                    </a>
                    <p style="margin-top: 1rem; color: #6b7280;">
                        ${job.applicants || 0} candidat${(job.applicants || 0) > 1 ? 's ont' : ' a'} déjà postulé
                    </p>
                </div>
            </article>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Ma Nouvelle Mission - Get in Talent</p>
            <div style="margin-top: 1rem;">
                <a href="/" style="color: #9ca3af; margin: 0 1rem;">Accueil</a>
                <a href="/#jobs" style="color: #9ca3af; margin: 0 1rem;">Toutes les missions</a>
                <a href="/#contact" style="color: #9ca3af; margin: 0 1rem;">Contact</a>
            </div>
        </div>
    </footer>
</body>
</html>`;
}

// Générer le sitemap
function generateSitemap(jobs) {
  const urls = [
    {
      loc: 'https://manouvellemission.com/',
      changefreq: 'daily',
      priority: '1.0'
    },
    ...jobs.map(job => ({
      loc: `https://manouvellemission.com/jobs/${job.slug || generateSlug(job.title, job.location)}`,
      lastmod: job.updated_at || job.created_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

// Générer le fichier robots.txt
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: https://manouvellemission.com/sitemap.xml`;
}

// Fonction principale
async function generateStaticPages() {
  console.log('🚀 Génération des pages statiques...');
  
  try {
    // Récupérer les jobs
    const jobs = await fetchJobs();
    console.log(`📊 ${jobs.length} jobs trouvés`);
    
    // Déterminer le répertoire de build
    const buildDir = join(process.cwd(), 'dist');
    
    // Créer le dossier jobs s'il n'existe pas
    const jobsDir = join(buildDir, 'jobs');
    await mkdir(jobsDir, { recursive: true });
    
    // Générer une page pour chaque job
    for (const job of jobs) {
      const slug = job.slug || generateSlug(job.title, job.location);
      const jobDir = join(jobsDir, slug);
      await mkdir(jobDir, { recursive: true });
      
      const html = generateJobPageHTML(job);
      await writeFile(join(jobDir, 'index.html'), html);
      console.log(`✅ Page générée: /jobs/${slug}`);
    }
    
    // Générer le sitemap
    const sitemap = generateSitemap(jobs);
    await writeFile(join(buildDir, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap généré');
    
    // Générer robots.txt
    const robotsTxt = generateRobotsTxt();
    await writeFile(join(buildDir, 'robots.txt'), robotsTxt);
    console.log('✅ robots.txt généré');

    // Copier success.html dans build si il existe
    try {
      const successContent = await readFile(join(process.cwd(), 'public', 'success.html'), 'utf8');
      await writeFile(join(buildDir, 'success.html'), successContent);
      console.log('✅ Page success.html copiée');
    } catch (error) {
      console.log('⚠️  Page success.html non trouvée dans public');
    }
    
    console.log('🎉 Génération terminée avec succès!');
    console.log(`📁 Fichiers générés dans: ${buildDir}`);
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
generateStaticPages();


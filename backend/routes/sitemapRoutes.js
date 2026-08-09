const express = require('express');
const router = express.Router();
const Blog = require('../models/BlogPost');
require('dotenv').config();

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

// Note: Instead of /api/sitemap.xml, these are typically served from the root. 
// However, since backend and frontend are on different ports in dev, 
// the user can set a rewrite rule in their webserver or just submit the full API URL.
// We'll serve it here on the API level.
router.get('/sitemap.xml', async (req, res) => {
  try {
    const blogs = await Blog.find({}, 'slug updatedAt');

    const staticPages = [
      '',
      '/about',
      '/gallery',
      '/testimonials',
      '/skin-analyzer',
      '/patient-portal',
      '/booking'
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach((page) => {
      xml += '  <url>\n';
      xml += `    <loc>${FRONTEND_URL}${page}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add dynamic blog pages
    blogs.forEach((blog) => {
      xml += '  <url>\n';
      xml += `    <loc>${FRONTEND_URL}/blog/${blog.slug}</loc>\n`;
      xml += `    <lastmod>${blog.updatedAt ? blog.updatedAt.toISOString() : new Date().toISOString()}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Also serve a basic robots.txt pointing to the sitemap
router.get('/robots.txt', (req, res) => {
  // If the backend runs on API_BASE, the sitemap URL will be there
  // Ideally, the frontend serves robots.txt pointing to the backend sitemap endpoint
  const sitemapUrl = req.protocol + '://' + req.get('host') + '/sitemap.xml';
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}`;
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

module.exports = router;

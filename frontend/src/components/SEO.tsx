import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  articleData?: {
    publishedTime?: string;
    author?: string;
    section?: string;
  };
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, url, type = 'website', articleData }) => {
  const fullTitle = `${title} | Dermelixir`;
  const defaultDesc = 'Dermelixir is your premium destination for advanced skin and hair care, specializing in aesthetic dermatology, anti-aging, and transformative treatments.';
  const finalDescription = description || defaultDesc;
  const defaultImage = 'https://drmeghapundir.in/default-og.jpg'; // Adjust to default branding image
  const finalImage = image || defaultImage;

  // JSON-LD Schema for Blog Articles
  const schemaMarkup = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "headline": title,
    "description": finalDescription,
    "image": finalImage,
    "author": {
      "@type": "Person",
      "name": articleData?.author || "Dr. Meghna Pundir"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Dermelixir",
      "logo": {
        "@type": "ImageObject",
        "url": defaultImage
      }
    },
    "datePublished": articleData?.publishedTime || new Date().toISOString()
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {url && <link rel="canonical" href={url} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      
      {/* Article Specific Open Graph */}
      {type === 'article' && articleData?.publishedTime && (
        <meta property="article:published_time" content={articleData.publishedTime} />
      )}
      {type === 'article' && articleData?.author && (
        <meta property="article:author" content={articleData.author} />
      )}
      {type === 'article' && articleData?.section && (
        <meta property="article:section" content={articleData.section} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {url && <meta property="twitter:url" content={url} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* JSON-LD Structured Data */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

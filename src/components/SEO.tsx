import { Helmet } from "react-helmet-async";

// Per-route head metadata: title, description, canonical, and og:url
// Keeps social-preview fallbacks in index.html for non-JS crawlers,
// while JS-executing crawlers get accurate self-referencing tags.
interface SEOProps {
  title: string;
  description: string;
  path: string;
}

const SITE_URL = "https://bpcalc.giovannimalagninoconsulting.com";

export const SEO = ({ title, description, path }: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

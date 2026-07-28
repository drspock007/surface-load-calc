import { useRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
import { TechnicalManualContent } from '@/components/documentation/TechnicalManualContent';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { SEO } from "@/components/SEO";

// TechnicalArticle JSON-LD payload for the CEPA methodology manual
const techArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechnicalArticle",
  "headline": "CEPA Buried Pipeline Surface Loading — Technical Reference Manual",
  "description": "Complete engineering reference: CEPA methodology, Boussinesq theory, formulas, and step-by-step calculations for stress on buried pipelines under surface loads.",
  "author": { "@type": "Organization", "name": "Giovanni Malagnino Consulting" },
  "publisher": {
    "@type": "Organization",
    "name": "Giovanni Malagnino Consulting",
    "logo": {
      "@type": "ImageObject",
      "url": "https://giovannimalagninoconsulting.com/wp-content/uploads/2021/08/logo_2021.png"
    }
  },
  "inLanguage": "en",
  "mainEntityOfPage": "https://bpcalc.giovannimalagninoconsulting.com/documentation",
  "about": ["CEPA Surface Loading Calculator", "Buried pipeline stress", "Boussinesq method"]
};

const Documentation = () => {
  const { toPDF, targetRef } = usePDF({
    filename: `CEPA_Technical_Reference_Manual_${new Date().toISOString().slice(0, 10)}.pdf`,
    page: { margin: 10, format: 'a4' },
  });
  const loading = false;

  return (
    <Layout>
      <SEO title="Technical Manual | CEPA Buried Pipeline Calculator" description="Complete engineering reference manual: CEPA methodology, Boussinesq theory, formulas, and calculation steps for buried pipeline surface loading." path="/documentation" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(techArticleJsonLd)}</script>
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Technical Reference Manual</h1>
          <p className="text-sm text-muted-foreground">Complete calculation methodology documentation</p>
        </div>
        <Button onClick={() => toPDF()} disabled={loading} className="gap-2">
          <FileDown className="w-4 h-4" />
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg border">
        <TechnicalManualContent ref={targetRef} />
      </div>
    </Layout>
  );
};

export default Documentation;

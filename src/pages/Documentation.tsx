import { useRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { Layout } from '@/components/Layout';
import { TechnicalManualContent } from '@/components/documentation/TechnicalManualContent';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { SEO } from "@/components/SEO";

const Documentation = () => {
  const { toPDF, targetRef } = usePDF({
    filename: `CEPA_Technical_Reference_Manual_${new Date().toISOString().slice(0, 10)}.pdf`,
    page: { margin: 10, format: 'a4' },
  });
  const loading = false;

  return (
    <Layout>
      <SEO title="Technical Manual | CEPA Buried Pipeline Calculator" description="Complete engineering reference manual: CEPA methodology, Boussinesq theory, formulas, and calculation steps for buried pipeline surface loading." path="/documentation" />
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

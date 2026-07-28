import { Facebook, Linkedin } from "lucide-react";

/** Site footer mirroring giovannimalagninoconsulting.com: Italy address, Canada address, social links. */
export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-8">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-foreground">
          {/* Column 1: Italy */}
          <div className="text-center md:text-left space-y-1">
            <p className="font-semibold">Giovanni Malagnino Consulting</p>
            <p>Address in Italy:</p>
            <p>Via Selva 79</p>
            <p>63835 Montappone FM</p>
            <p>Italie</p>
            <p>
              <a href="tel:+393927290392" className="hover:text-primary transition-colors">
                +39 392 729 0392
              </a>
            </p>
            <p>
              <a
                href="mailto:giovanni@giovannimalagninoconsulting.com"
                className="hover:text-primary transition-colors break-all"
              >
                giovanni@giovannimalagninoconsulting.com
              </a>
            </p>
          </div>

          {/* Column 2: Canada */}
          <div className="text-center md:text-left space-y-1">
            <p>&nbsp;</p>
            <p>Address in Canada:</p>
            <p>1395, Rue Fleury Est, Bureau 102.2</p>
            <p>Montréal, QC, H2C 1R7</p>
            <p>Canada</p>
            <p>
              <a href="tel:+14384480997" className="hover:text-primary transition-colors">
                +1 438 448 0997
              </a>
            </p>
          </div>

          {/* Column 3: Social links */}
          <div className="flex items-start justify-center md:justify-end gap-3">
            <a
              href="https://www.facebook.com/giovannimalagninoconsulting"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on Facebook"
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/giovannimalagnino/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on LinkedIn"
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

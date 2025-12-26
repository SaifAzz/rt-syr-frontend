import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Briefcase, 
  FileText, 
  Mail, 
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

export function Footer() {
  const { t } = useTranslation();
  
  const footerLinks = {
    platform: [
      { name: t('footer.browseJobs'), href: "/jobs" },
      { name: t('footer.browseTenders'), href: "/tenders" },
      { name: t('footer.forCompanies'), href: "/signup?type=company" },
      { name: t('footer.forOrganizations'), href: "/signup?type=organization" },
    ],
    support: [
      { name: t('footer.aboutUs'), href: "/about" },
      { name: t('footer.reportIssue'), href: "/report" },
      { name: t('footer.privacyPolicy'), href: "/privacy" },
      { name: t('footer.termsOfService'), href: "/terms" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-bold text-lg">RT</span>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-foreground">RT-SYR</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.platform')}</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary" />
                contact@rt-syr.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                Damascus, Syria
              </li>
            </ul>
            <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                {t('footer.neverCharge')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RT-SYR. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-primary" />
              #SyrianJobs
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-accent" />
              #SyrianTenders
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

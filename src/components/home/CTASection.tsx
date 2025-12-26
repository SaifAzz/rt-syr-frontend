import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield } from "lucide-react";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl p-8 lg:p-16 border border-border relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-accent opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>{t('home.cta.badge')}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {t('home.cta.title1')}
                <span className="text-gradient-primary block mt-2">{t('home.cta.title2')}</span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {t('home.cta.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/signup" className="group">
                    {t('home.cta.createAccount')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/about">
                    {t('home.cta.learnMore')}
                  </Link>
                </Button>
              </div>

              {/* Trust note */}
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-success" />
                <span>{t('home.cta.trustNote')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

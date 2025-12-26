import { 
  Users, 
  Building2, 
  FileCheck, 
  Search, 
  Shield, 
  Globe,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  const { t } = useTranslation();
  
  const features = [
    {
      title: t('home.features.forJobSeekers.title'),
      description: t('home.features.forJobSeekers.description'),
      icon: Users,
      color: "primary",
      link: "/jobs",
      linkText: t('home.features.forJobSeekers.linkText'),
      highlights: [
        t('home.features.forJobSeekers.highlight1'),
        t('home.features.forJobSeekers.highlight2'),
        t('home.features.forJobSeekers.highlight3'),
      ],
    },
    {
      title: t('home.features.forCompanies.title'),
      description: t('home.features.forCompanies.description'),
      icon: Building2,
      color: "accent",
      link: "/signup?type=company",
      linkText: t('home.features.forCompanies.linkText'),
      highlights: [
        t('home.features.forCompanies.highlight1'),
        t('home.features.forCompanies.highlight2'),
        t('home.features.forCompanies.highlight3'),
      ],
    },
    {
      title: t('home.features.forOrganizations.title'),
      description: t('home.features.forOrganizations.description'),
      icon: FileCheck,
      color: "info",
      link: "/signup?type=organization",
      linkText: t('home.features.forOrganizations.linkText'),
      highlights: [
        t('home.features.forOrganizations.highlight1'),
        t('home.features.forOrganizations.highlight2'),
        t('home.features.forOrganizations.highlight3'),
      ],
    },
  ];

  const platformFeatures = [
    {
      icon: Search,
      title: t('home.features.smartSearch.title'),
      description: t('home.features.smartSearch.description'),
    },
    {
      icon: Shield,
      title: t('home.features.verifiedListings.title'),
      description: t('home.features.verifiedListings.description'),
    },
    {
      icon: Globe,
      title: t('home.features.bilingualSupport.title'),
      description: t('home.features.bilingualSupport.description'),
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('home.features.title')}{" "}
            <span className="text-gradient-primary">{t('home.features.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('home.features.subtitle')}
          </p>
        </div>

        {/* Main feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-primary/30 transition-all duration-300 hover-lift animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                feature.color === "primary" && "bg-primary/10 text-primary",
                feature.color === "accent" && "bg-accent/10 text-accent",
                feature.color === "info" && "bg-info/10 text-info",
              )}>
                <feature.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2 mb-6">
                {feature.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {highlight}
                  </li>
                ))}
              </ul>

              {/* Link */}
              <Button variant="ghost" className="group/btn p-0 h-auto" asChild>
                <Link to={feature.link}>
                  {feature.linkText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Platform features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platformFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-6 rounded-xl bg-secondary/30 animate-fade-up"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

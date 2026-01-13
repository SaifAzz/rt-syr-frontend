import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import {
  Shield,
  Users,
  Target,
  Heart,
  CheckCircle,
  ArrowRight,
  Briefcase,
  FileText,
  Globe,
  Lock,
  Eye,
  AlertTriangle,
  BadgeCheck,
  DollarSign,
  HelpCircle
} from "lucide-react";

const About = () => {
  const { t } = useTranslation();
  
  const howItWorks = [
    {
      step: t('about.howItWorks.step1.step'),
      title: t('about.howItWorks.step1.title'),
      description: t('about.howItWorks.step1.description'),
    },
    {
      step: t('about.howItWorks.step2.step'),
      title: t('about.howItWorks.step2.title'),
      description: t('about.howItWorks.step2.description'),
    },
    {
      step: t('about.howItWorks.step3.step'),
      title: t('about.howItWorks.step3.title'),
      description: t('about.howItWorks.step3.description'),
    },
    {
      step: t('about.howItWorks.step4.step'),
      title: t('about.howItWorks.step4.title'),
      description: t('about.howItWorks.step4.description'),
    },
  ];
  const location = useLocation();

  // Handle scroll to hash on mount
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  const values = [
    {
      icon: Eye,
      titleKey: "about.values.transparency.title",
      descriptionKey: "about.values.transparency.description",
    },
    {
      icon: Shield,
      titleKey: "about.values.integrity.title",
      descriptionKey: "about.values.integrity.description",
    },
    {
      icon: Users,
      titleKey: "about.values.inclusivity.title",
      descriptionKey: "about.values.inclusivity.description",
    },
    {
      icon: CheckCircle,
      titleKey: "about.values.reliability.title",
      descriptionKey: "about.values.reliability.description",
    },
    {
      icon: Target,
      titleKey: "about.values.impactDriven.title",
      descriptionKey: "about.values.impactDriven.description",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-hero py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {t('about.hero.title')}
                <span className="text-gradient-primary block mt-2">{t('about.hero.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t('about.hero.description')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">
                    {t('about.hero.getStarted')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/jobs">{t('about.hero.browseOpportunities')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Who Are We */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-8 text-center">
                {t("about.whoAreWe.title")}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="text-base lg:text-lg">
                  {t("about.whoAreWe.paragraph1")}
                </p>
                <p className="text-base lg:text-lg">
                  {t("about.whoAreWe.paragraph2")}
                </p>
                <p className="text-base lg:text-lg">
                  {t("about.whoAreWe.paragraph3")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-8 text-center">
                {t("about.vision.title")}
              </h2>
              <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border shadow-sm">
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed text-center">
                  {t("about.vision.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 text-center">
                {t("about.mission.title")}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-center">
                {t("about.mission.description")}
              </p>
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-4 text-center">
                  {t("about.mission.aimTitle")}
                </h3>
                <ul className="space-y-3 text-muted-foreground max-w-2xl mx-auto">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.mission.aim1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.mission.aim2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.mission.aim3")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.mission.aim4")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t("about.values.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("about.values.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {values.map((value, index) => (
                <div 
                  key={value.titleKey}
                  className="bg-card rounded-xl p-6 border border-border animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t(value.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(value.descriptionKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t('about.howItWorks.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('about.howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div 
                  key={item.step}
                  className="relative animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 right-0 w-1/2 border-t-2 border-dashed border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Publishing Policy */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 text-center">
                {t("about.publishingPolicy.title")}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed text-center">
                {t("about.publishingPolicy.introduction")}
              </p>

              <div className="space-y-8">
                {/* Eligibility of Content */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {t("about.publishingPolicy.eligibility.title")}
                  </h3>
                  <p className="text-muted-foreground mb-4 font-medium">
                    {t("about.publishingPolicy.eligibility.subtitle")}
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.publishingPolicy.eligibility.item1")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.publishingPolicy.eligibility.item2")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.publishingPolicy.eligibility.item3")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.publishingPolicy.eligibility.item4")}</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic">
                    {t("about.publishingPolicy.eligibility.note")}
                  </p>
                </div>

                {/* Content Standards */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {t("about.publishingPolicy.contentStandards.title")}
                  </h3>
                  <p className="text-muted-foreground mb-4 font-medium">
                    {t("about.publishingPolicy.contentStandards.subtitle")}
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.publishingPolicy.contentStandards.item1")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.publishingPolicy.contentStandards.item2")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.publishingPolicy.contentStandards.item3")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.publishingPolicy.contentStandards.item4")}</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic">
                    {t("about.publishingPolicy.contentStandards.note")}
                  </p>
                </div>

                {/* Responsibility */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {t("about.publishingPolicy.responsibility.title")}
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>{t("about.publishingPolicy.responsibility.paragraph1")}</p>
                    <p>{t("about.publishingPolicy.responsibility.paragraph2")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code of Conduct */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 text-center">
                {t("about.codeOfConduct.title")}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed text-center">
                {t("about.codeOfConduct.introduction")}
              </p>

              <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.codeOfConduct.item1")}</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.codeOfConduct.item2")}</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.codeOfConduct.item3")}</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.codeOfConduct.item4")}</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    {t("about.codeOfConduct.violation")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section id="privacy-policy" className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 text-center">
                {t("about.privacyPolicy.title")}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed text-center">
                {t("about.privacyPolicy.introduction")}
              </p>

              <div className="space-y-8">
                {/* Information We Collect */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {t("about.privacyPolicy.informationWeCollect.title")}
                  </h3>
                  <p className="text-muted-foreground mb-4 font-medium">
                    {t("about.privacyPolicy.informationWeCollect.subtitle")}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.privacyPolicy.informationWeCollect.item1")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.privacyPolicy.informationWeCollect.item2")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.privacyPolicy.informationWeCollect.item3")}</span>
                    </li>
                  </ul>
                </div>

                {/* Use of Information */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {t("about.privacyPolicy.useOfInformation.title")}
                  </h3>
                  <p className="text-muted-foreground mb-4 font-medium">
                    {t("about.privacyPolicy.useOfInformation.subtitle")}
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.privacyPolicy.useOfInformation.item1")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.privacyPolicy.useOfInformation.item2")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.privacyPolicy.useOfInformation.item3")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.privacyPolicy.useOfInformation.item4")}</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic">
                    {t("about.privacyPolicy.useOfInformation.note")}
                  </p>
                </div>

                {/* Data Protection */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {t("about.privacyPolicy.dataProtection.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("about.privacyPolicy.dataProtection.description")}
                  </p>
                </div>

                {/* User Rights */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {t("about.privacyPolicy.userRights.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("about.privacyPolicy.userRights.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer / Terms */}
        <section id="terms" className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 text-center">
                {t("about.disclaimer.title")}
              </h2>
              <div className="bg-card rounded-xl p-6 lg:p-8 border border-border space-y-4 text-muted-foreground">
                <p>{t("about.disclaimer.paragraph1")}</p>
                <p>{t("about.disclaimer.paragraph2")}</p>
                <p>{t("about.disclaimer.paragraph3")}</p>
                <p>{t("about.disclaimer.paragraph4")}</p>
                <p className="font-medium text-foreground">{t("about.disclaimer.paragraph5")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Anti-Fraud & Scam Warning */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    {t("about.antiFraud.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground mb-4 font-medium">
                  {t("about.antiFraud.subtitle")}
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <span>{t("about.antiFraud.item1")}</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <span>{t("about.antiFraud.item2")}</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <span>{t("about.antiFraud.item3")}</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-warning font-medium">
                    {t("about.antiFraud.warning")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verification System Policy */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 text-center">
                {t("about.verificationSystem.title")}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed text-center">
                {t("about.verificationSystem.introduction")}
              </p>

              <div className="space-y-8">
                {/* Verification Labels */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <BadgeCheck className="w-6 h-6 text-primary" />
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      {t("about.verificationSystem.labels.title")}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4 font-medium">
                    {t("about.verificationSystem.labels.subtitle")}
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.verificationSystem.labels.item1")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.verificationSystem.labels.item2")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.verificationSystem.labels.item3")}</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.verificationSystem.labels.item4")}</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic">
                    {t("about.verificationSystem.labels.note")}
                  </p>
                </div>

                {/* Limitations */}
                <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {t("about.verificationSystem.limitations.title")}
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.verificationSystem.limitations.item1")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.verificationSystem.limitations.item2")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("about.verificationSystem.limitations.item3")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Paid Services Policy */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    {t("about.paidServices.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  {t("about.paidServices.introduction")}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.paidServices.item1")}</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.paidServices.item2")}</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t("about.paidServices.item3")}</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-border space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("about.paidServices.note1")}
                  </p>
                  {t("about.paidServices.note2") && (
                    <p className="text-sm text-muted-foreground">
                      {t("about.paidServices.note2")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <HelpCircle className="w-8 h-8 text-primary" />
                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    {t("about.faq.title")}
                  </h2>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">
                    {t("about.faq.q1.question")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("about.faq.q1.answer")}
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">
                    {t("about.faq.q2.question")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("about.faq.q2.answer")}
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">
                    {t("about.faq.q3.question")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("about.faq.q3.answer")}
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">
                    {t("about.faq.q4.question")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("about.faq.q4.answer")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security note */}
        <section className="py-16 lg:py-24 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {t('about.security.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('about.security.description')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>{t('about.security.noFees')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>{t('about.security.verifiedListings')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>{t('about.security.reportSuspicious')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

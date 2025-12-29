import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  X,
  Briefcase,
  Building2,
  Users,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react";

const Pricing = () => {
  const { t } = useTranslation();

  const pricingPlans = [
    {
      name: t('pricing.jobSeeker.name'),
      description: t('pricing.jobSeeker.description'),
      price: t('pricing.jobSeeker.price'),
      period: t('pricing.jobSeeker.period'),
      icon: Users,
      color: "primary",
      popular: false,
      features: [
        t('pricing.jobSeeker.feature1'),
        t('pricing.jobSeeker.feature2'),
        t('pricing.jobSeeker.feature3'),
        t('pricing.jobSeeker.feature4'),
        t('pricing.jobSeeker.feature5'),
      ],
      cta: t('pricing.jobSeeker.cta'),
      ctaLink: "/signup",
    },
    {
      name: t('pricing.company.name'),
      description: t('pricing.company.description'),
      price: t('pricing.company.price'),
      period: t('pricing.company.period'),
      icon: Briefcase,
      color: "accent",
      popular: true,
      badge: t('pricing.company.badge'),
      features: [
        t('pricing.company.feature1'),
        t('pricing.company.feature2'),
        t('pricing.company.feature3'),
        t('pricing.company.feature4'),
        t('pricing.company.feature5'),
        t('pricing.company.feature6'),
      ],
      cta: t('pricing.company.cta'),
      ctaLink: "/signup",
    },
    {
      name: t('pricing.organization.name'),
      description: t('pricing.organization.description'),
      price: t('pricing.organization.price'),
      period: t('pricing.organization.period'),
      icon: Building2,
      color: "primary",
      popular: false,
      features: [
        t('pricing.organization.feature1'),
        t('pricing.organization.feature2'),
        t('pricing.organization.feature3'),
        t('pricing.organization.feature4'),
        t('pricing.organization.feature5'),
        t('pricing.organization.feature6'),
      ],
      cta: t('pricing.organization.cta'),
      ctaLink: "/signup",
    },
  ];

  const faqs = [
    {
      question: t('pricing.faq1.question'),
      answer: t('pricing.faq1.answer'),
    },
    {
      question: t('pricing.faq2.question'),
      answer: t('pricing.faq2.answer'),
    },
    {
      question: t('pricing.faq3.question'),
      answer: t('pricing.faq3.answer'),
    },
    {
      question: t('pricing.faq4.question'),
      answer: t('pricing.faq4.answer'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                <Sparkles className="w-3 h-3 mr-2" />
                {t('pricing.hero.badge')}
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {t('pricing.hero.title')}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t('pricing.hero.subtitle')}
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('pricing.hero.benefit1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('pricing.hero.benefit2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('pricing.hero.benefit3')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {pricingPlans.map((plan, index) => {
                const Icon = plan.icon;
                const isPopular = plan.popular;
                
                return (
                  <Card
                    key={plan.name}
                    className={`
                      relative transition-all duration-300 hover-lift
                      ${isPopular ? 'border-primary shadow-lg scale-105 lg:scale-110' : 'border-border'}
                    `}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4
                        ${plan.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'}
                      `}>
                        <Icon className={`
                          w-8 h-8
                          ${plan.color === 'primary' ? 'text-primary' : 'text-accent'}
                        `} />
                      </div>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-base mt-2">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                          {plan.period && (
                            <span className="text-muted-foreground">/{plan.period}</span>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-4">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className={`
                              w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                              ${plan.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'}
                            `}>
                              <Check className={`
                                w-3 h-3
                                ${plan.color === 'primary' ? 'text-primary' : 'text-accent'}
                              `} />
                            </div>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-6">
                      <Button
                        variant={isPopular ? "hero" : "outline"}
                        className="w-full"
                        size="lg"
                        asChild
                      >
                        <Link to={plan.ctaLink}>
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t('pricing.comparison.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('pricing.comparison.subtitle')}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4 font-semibold text-foreground">
                            {t('pricing.comparison.feature')}
                          </th>
                          <th className="text-center p-4 font-semibold text-foreground">
                            {t('pricing.comparison.jobSeeker')}
                          </th>
                          <th className="text-center p-4 font-semibold text-foreground">
                            {t('pricing.comparison.company')}
                          </th>
                          <th className="text-center p-4 font-semibold text-foreground">
                            {t('pricing.comparison.organization')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="p-4 text-muted-foreground">{t('pricing.comparison.row1.feature')}</td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-4 text-muted-foreground">{t('pricing.comparison.row2.feature')}</td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-4 text-muted-foreground">{t('pricing.comparison.row3.feature')}</td>
                          <td className="p-4 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-4 text-muted-foreground">{t('pricing.comparison.row4.feature')}</td>
                          <td className="p-4 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4 text-muted-foreground">{t('pricing.comparison.row5.feature')}</td>
                          <td className="p-4 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-4 text-center">
                            <Check className="w-5 h-5 text-success mx-auto" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t('pricing.faq.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('pricing.faq.subtitle')}
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {t('pricing.cta.title')}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t('pricing.cta.subtitle')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">
                    {t('pricing.cta.button')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/about">{t('pricing.cta.learnMore')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;


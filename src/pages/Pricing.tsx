import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { pricingAPI, type PricingPlan } from "@/lib/api";
import {
  Check,
  Briefcase,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Sparkles,
  FileText,
  Store,
  ShoppingBag
} from "lucide-react";

const Pricing = () => {
  const { t } = useTranslation();

  // Fetch pricing plans from API
  const { data: pricingData, isLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      try {
        return await pricingAPI.getAll();
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Transform API data to component format
  const transformPlan = (
    plan: PricingPlan | undefined,
    icon: any,
    color: "primary" | "accent",
    popular: boolean = false,
    badge?: string,
    defaultName?: string,
    defaultDescription?: string,
    planType?: string
  ) => {
    // If no plan data from API, create a placeholder plan
    if (!plan) {
      return {
        name: defaultName || "Plan",
        description: defaultDescription || "Coming soon",
        price: "Contact Us",
        originalPrice: undefined,
        period: "",
        icon,
        color,
        popular,
        badge,
        features: ["Contact us for details"],
        cta: "Contact Us",
        ctaLink: "/signup",
        planId: `placeholder-${planType}`,
        isPlaceholder: true,
      };
    }

    // Use originalPrice from API if available (indicates discount)
    const hasDiscount = plan.originalPrice !== undefined && plan.originalPrice !== null;

    // Format prices
    const formatPrice = (price: number | string, currency: string): string => {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (isNaN(numPrice)) return `${currency} ${price}`;
      // Handle decimal prices (show decimals if needed, otherwise show as integer)
      if (numPrice % 1 !== 0) {
        return `${currency} ${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return `${currency} ${numPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    // If originalPrice exists, price is the discounted price
    const displayPrice = hasDiscount
      ? formatPrice(plan.price, plan.currency)
      : formatPrice(plan.price, plan.currency);

    const originalPriceDisplay = hasDiscount
      ? formatPrice(plan.originalPrice!, plan.currency)
      : undefined;

    const period = plan.period === 'yearly' ? 'per year' : plan.period === 'one-time' ? (plan.plan_type === 'tender' ? 'per tender' : 'per job') : '';

    return {
      name: plan.name,
      description: plan.description,
      price: displayPrice,
      originalPrice: originalPriceDisplay,
      period,
      icon,
      color,
      popular,
      badge,
      features: plan.features || [],
      cta: plan.plan_type === 'vendorAdvertisement' ? "Contact Us" : "Get Started",
      ctaLink: "/signup",
      planId: plan.plan_id,
      isPlaceholder: false,
    };
  };

  // Build pricing plans array from API data - always show all 7 plan types
  const pricingPlans = [
    transformPlan(
      pricingData?.tender?.single,
      FileText,
      "primary",
      false,
      undefined,
      "Single Tender",
      "Perfect for businesses or individuals who need to publish a one-time tender quickly and efficiently without long-term commitment.",
      "tender-single"
    ),
    transformPlan(
      pricingData?.tender?.yearly,
      FileText,
      "primary",
      false,
      undefined,
      "Unlimited Tender Annual Plan",
      "A dedicated annual plan for organizations that frequently publish tenders and want unlimited access without per-post costs.",
      "tender-yearly"
    ),
    transformPlan(
      pricingData?.job?.single,
      Briefcase,
      "accent",
      false,
      undefined,
      "Single Job",
      "Ideal for employers seeking to advertise a single job vacancy and reach relevant candidates instantly.",
      "job-single"
    ),
    transformPlan(
      pricingData?.job?.yearly,
      Briefcase,
      "accent",
      false,
      undefined,
      "Unlimited Job Annual Plan",
      "Ideal for recruitment agencies or large employers with continuous hiring needs.",
      "job-yearly"
    ),
    transformPlan(
      pricingData?.combined,
      Zap,
      "primary",
      true,
      "Best Value",
      "Combined Plan",
      "Best value package combining both tender and job posting capabilities.",
      "combined"
    ),
    transformPlan(
      pricingData?.vendor,
      Store,
      "accent",
      false,
      undefined,
      "Vendor",
      "For vendors and suppliers to showcase their services and products.",
      "vendor"
    ),
    transformPlan(
      pricingData?.vendorAdvertisement,
      ShoppingBag,
      "primary",
      false,
      undefined,
      "Vendor Advertisement",
      "Premium advertising solution for vendors to increase visibility and reach.",
      "vendor-advertisement"
    ),
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
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading pricing plans...</p>
              </div>
            ) : pricingPlans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pricing plans available at the moment.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {pricingPlans.map((plan, index) => {
                  const Icon = plan.icon;
                  const isPopular = plan.popular;

                  return (
                    <Card
                      key={plan.name}
                      className={`
                      relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col
                      ${isPopular ? 'border-2 border-primary shadow-lg bg-primary/5' : 'border'}
                    `}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold shadow-md">
                            <Star className="w-3 h-3 mr-1" />
                            {plan.badge}
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-6 pt-8">
                        <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4
                        ${plan.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'}
                      `}>
                          <Icon className={`
                          w-7 h-7
                          ${plan.color === 'primary' ? 'text-primary' : 'text-accent'}
                        `} />
                        </div>
                        <CardTitle className="text-xl font-bold mb-2">{plan.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {plan.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-grow flex flex-col">
                        <div className="text-center mb-6 pb-6 border-b">
                          <div className="flex flex-col items-center justify-center">
                            {plan.originalPrice && (
                              <span className="text-lg text-muted-foreground line-through mb-1">{plan.originalPrice}</span>
                            )}
                            <span className="text-3xl font-bold text-foreground leading-none">{plan.price}</span>
                            {plan.period && (
                              <span className="text-sm text-muted-foreground mt-1">{plan.period}</span>
                            )}
                          </div>
                        </div>

                        <ul className="space-y-3 flex-grow">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <div className={`
                              w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                              ${plan.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'}
                            `}>
                                <Check className={`
                                w-2.5 h-2.5
                                ${plan.color === 'primary' ? 'text-primary' : 'text-accent'}
                              `} />
                              </div>
                              <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter className="pt-6 pb-6">
                        <Button
                          variant={isPopular ? "default" : "outline"}
                          className={`w-full font-semibold ${isPopular ? 'bg-primary hover:bg-primary/90' : ''} ${plan.isPlaceholder ? 'opacity-60' : ''}`}
                          size="lg"
                          asChild={!plan.isPlaceholder}
                          disabled={plan.isPlaceholder}
                        >
                          {plan.isPlaceholder ? (
                            <span>
                              {plan.cta}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </span>
                          ) : (
                            <Link to={plan.ctaLink}>
                              {plan.cta}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
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


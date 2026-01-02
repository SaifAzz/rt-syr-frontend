import { Briefcase, Users, Building2, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getHomeStats, formatStatValue } from "@/lib/utils";
import { useEffect, useState } from "react";

export function StatsSection() {
  const { t } = useTranslation();
  const [homeStats, setHomeStats] = useState(getHomeStats());

  // Listen for storage changes to update stats in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      setHomeStats(getHomeStats());
    };

    // Listen for custom event when stats are updated
    window.addEventListener('homeStatsUpdated', handleStorageChange);
    
    // Also listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('homeStatsUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const stats = [
    {
      label: t('home.stats.activeOpportunities'),
      value: formatStatValue(homeStats.activeOpportunities),
      icon: Briefcase,
      description: t('home.stats.jobsTenders'),
    },
    {
      label: t('home.stats.registeredUsers'),
      value: formatStatValue(homeStats.registeredUsers),
      icon: Users,
      description: t('home.stats.jobSeekers'),
    },
    {
      label: t('home.stats.verifiedCompanies'),
      value: formatStatValue(homeStats.verifiedCompanies),
      icon: Building2,
      description: t('home.stats.trustedEmployers'),
    },
    {
      label: t('home.stats.organizations'),
      value: formatStatValue(homeStats.organizations),
      icon: FileText,
      description: t('home.stats.tenderPublishers'),
    },
  ];
  return (
    <section className="py-16 lg:py-24 bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            {t('home.stats.title')}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            {t('home.stats.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/80 font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-primary-foreground/60">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

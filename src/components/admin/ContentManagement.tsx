import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Globe, FileText } from 'lucide-react';
import { contentAPI, type ContentRecord } from '@/lib/api';

// Default English content
const defaultEnglishContent = {
  hero: {
    badge: 'Trusted Platform for Syrian Opportunities',
    title1: 'Your Gateway to',
    title2: 'Find Your Dream Job',
    title3: 'Discover Tender Opportunities',
    title4: 'Connect with Top Companies',
    title5: 'Build Your Career in Syria',
    subtitle: 'Connect with reputable companies and discover authentic tender opportunities across Syria.',
    zeroFees: 'Zero fees for applicants.',
    browseJobs: 'Browse Jobs',
    viewTenders: 'View Tenders',
  },
  features: {
    title: 'One Platform,',
    titleHighlight: 'Endless Opportunities',
    subtitle: 'Everything you need to find jobs and tenders in Syria',
  },
  cta: {
    badge: 'Join Today',
    title1: 'Ready to Get Started?',
    title2: 'Create Your Account Now',
    subtitle: 'Join thousands of job seekers, companies, and organizations already using RT-SYR',
    createAccount: 'Create Account',
    learnMore: 'Learn More',
    trustNote: '100% Free for Job Seekers',
  },
};

// Default Arabic content
const defaultArabicContent = {
  hero: {
    badge: 'منصة موثوقة للفرص السورية',
    title1: 'بوابتك إلى',
    title2: 'ابحث عن وظيفة أحلامك',
    title3: 'اكتشف فرص المناقصات',
    title4: 'تواصل مع أفضل الشركات',
    title5: 'ابني مسيرتك المهنية في سوريا',
    subtitle: 'تواصل مع شركات موثوقة واكتشف فرص مناقصات حقيقية في جميع أنحاء سوريا.',
    zeroFees: 'بدون رسوم للمتقدمين.',
    browseJobs: 'تصفح الوظائف',
    viewTenders: 'عرض المناقصات',
  },
  features: {
    title: 'منصة واحدة،',
    titleHighlight: 'فرص لا تنتهي',
    subtitle: 'كل ما تحتاجه للعثور على الوظائف والمناقصات في سوريا',
  },
  cta: {
    badge: 'انضم اليوم',
    title1: 'هل أنت مستعد للبدء؟',
    title2: 'أنشئ حسابك الآن',
    subtitle: 'انضم إلى آلاف الباحثين عن عمل والشركات والمنظمات التي تستخدم بالفعل RT-SYR',
    createAccount: 'إنشاء حساب',
    learnMore: 'اعرف المزيد',
    trustNote: '100% مجاني للباحثين عن عمل',
  },
};

export function ContentManagement() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('home');
  // Initialize language from i18n or localStorage
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language') || i18n.language || 'en';
    return savedLang.startsWith('ar') ? 'ar' : 'en';
  });

  // Homepage content state - initialize with default content based on language
  const [homeContent, setHomeContent] = useState(
    language === 'ar' ? defaultArabicContent : defaultEnglishContent
  );

  // Load content from API when language changes
  useEffect(() => {
    const loadContent = async () => {
      // Immediately set default content for the selected language
      const defaultContent = language === 'ar' ? defaultArabicContent : defaultEnglishContent;
      setHomeContent(defaultContent);

      try {
        // Try to load saved content from API (non-blocking)
        const [heroContent, featuresContent, ctaContent] = await Promise.allSettled([
          contentAPI.getByKey('hero', language),
          contentAPI.getByKey('features', language),
          contentAPI.getByKey('cta', language),
        ]);

        const loadedContent = {
          hero: heroContent.status === 'fulfilled' && heroContent.value?.value
            ? (typeof heroContent.value.value === 'string'
              ? JSON.parse(heroContent.value.value)
              : heroContent.value.value)
            : defaultContent.hero,
          features: featuresContent.status === 'fulfilled' && featuresContent.value?.value
            ? (typeof featuresContent.value.value === 'string'
              ? JSON.parse(featuresContent.value.value)
              : featuresContent.value.value)
            : defaultContent.features,
          cta: ctaContent.status === 'fulfilled' && ctaContent.value?.value
            ? (typeof ctaContent.value.value === 'string'
              ? JSON.parse(ctaContent.value.value)
              : ctaContent.value.value)
            : defaultContent.cta,
        };

        setHomeContent(loadedContent);
      } catch (error) {
        // If API fails, keep default content (already set above)
        console.log('Using default content for language:', language);
      }
    };

    loadContent();
  }, [language]);

  const updateContentMutation = useMutation({
    mutationFn: async ({ key, section, value }: { key: string; section: string; value: any }) => {
      try {
        // Try to update first, if it exists
        return await contentAPI.update(key, language, {
          value: typeof value === 'string' ? value : JSON.stringify(value),
          type: typeof value === 'string' ? 'text' : 'json',
        });
      } catch (error: any) {
        // If update fails (404), create new content
        if (error.status === 404 || error.isNetworkError) {
          return await contentAPI.create({
            key,
            section,
            language,
            value: typeof value === 'string' ? value : JSON.stringify(value),
            type: typeof value === 'string' ? 'text' : 'json',
          });
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث المحتوى بنجاح!' : 'Content updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['content'] });
      // Reload content after save
      const defaultContent = language === 'ar' ? defaultArabicContent : defaultEnglishContent;
      setHomeContent(defaultContent);
    },
    onError: (error: Error) => {
      toast.error(language === 'ar'
        ? 'فشل تحديث المحتوى. سيتم حفظه محليًا.'
        : error.message || 'Failed to update content. Will save locally.');
      // Even if API fails, we keep the content in state
    },
  });

  const handleSave = (section: string, key: string, value: any) => {
    updateContentMutation.mutate({ key, section, value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.admin.contentManagement')}</h2>
          <p className="text-muted-foreground">{t('dashboard.admin.contentDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={language}
            onValueChange={(newLang) => {
              setLanguage(newLang);
              // Update i18n language as well
              i18n.changeLanguage(newLang);
              localStorage.setItem('language', newLang);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('dashboard.admin.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('dashboard.admin.english')}</SelectItem>
              <SelectItem value="ar">{t('dashboard.admin.arabic')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList>
          <TabsTrigger value="home">
            <Globe className="w-4 h-4 mr-2" />
            {t('home.hero.title1')} / {language === 'ar' ? 'الصفحة الرئيسية' : 'Homepage'}
          </TabsTrigger>
          <TabsTrigger value="general">
            <FileText className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'عام' : 'General'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'قسم البطل' : 'Hero Section'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'محتوى البانر الرئيسي على الصفحة الرئيسية' : 'Main banner content on homepage'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نص الشارة' : 'Badge Text'}</Label>
                <Input
                  value={homeContent.hero.badge}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      hero: { ...homeContent.hero, badge: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان 1' : 'Title 1'}</Label>
                <Input
                  value={homeContent.hero.title1}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      hero: { ...homeContent.hero, title1: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان 2' : 'Title 2'}</Label>
                  <Input
                    value={homeContent.hero.title2}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, title2: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان 3' : 'Title 3'}</Label>
                  <Input
                    value={homeContent.hero.title3}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, title3: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان 4' : 'Title 4'}</Label>
                  <Input
                    value={homeContent.hero.title4}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, title4: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان 5' : 'Title 5'}</Label>
                  <Input
                    value={homeContent.hero.title5}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, title5: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان الفرعي' : 'Subtitle'}</Label>
                <Textarea
                  value={homeContent.hero.subtitle}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      hero: { ...homeContent.hero, subtitle: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'زر تصفح الوظائف' : 'Browse Jobs Button'}</Label>
                  <Input
                    value={homeContent.hero.browseJobs}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, browseJobs: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'زر عرض المناقصات' : 'View Tenders Button'}</Label>
                  <Input
                    value={homeContent.hero.viewTenders}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, viewTenders: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('home', 'hero', homeContent.hero)}
                disabled={updateContentMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'حفظ قسم البطل' : 'Save Hero Section'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'قسم المميزات' : 'Features Section'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'محتوى عرض المميزات' : 'Features showcase content'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان' : 'Title'}</Label>
                <Input
                  value={homeContent.features.title}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      features: { ...homeContent.features, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'تمييز العنوان' : 'Title Highlight'}</Label>
                <Input
                  value={homeContent.features.titleHighlight}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      features: { ...homeContent.features, titleHighlight: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان الفرعي' : 'Subtitle'}</Label>
                <Textarea
                  value={homeContent.features.subtitle}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      features: { ...homeContent.features, subtitle: e.target.value },
                    })
                  }
                  rows={2}
                />
              </div>
              <Button
                onClick={() => handleSave('home', 'features', homeContent.features)}
                disabled={updateContentMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'حفظ قسم المميزات' : 'Save Features Section'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'قسم الدعوة للعمل' : 'CTA Section'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'محتوى قسم الدعوة للعمل' : 'Call-to-action section content'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الشارة' : 'Badge'}</Label>
                <Input
                  value={homeContent.cta.badge}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      cta: { ...homeContent.cta, badge: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان 1' : 'Title 1'}</Label>
                  <Input
                    value={homeContent.cta.title1}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        cta: { ...homeContent.cta, title1: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان 2' : 'Title 2'}</Label>
                  <Input
                    value={homeContent.cta.title2}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        cta: { ...homeContent.cta, title2: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان الفرعي' : 'Subtitle'}</Label>
                <Textarea
                  value={homeContent.cta.subtitle}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      cta: { ...homeContent.cta, subtitle: e.target.value },
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'زر إنشاء الحساب' : 'Create Account Button'}</Label>
                  <Input
                    value={homeContent.cta.createAccount}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        cta: { ...homeContent.cta, createAccount: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'زر اعرف المزيد' : 'Learn More Button'}</Label>
                  <Input
                    value={homeContent.cta.learnMore}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        cta: { ...homeContent.cta, learnMore: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('home', 'cta', homeContent.cta)}
                disabled={updateContentMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'حفظ قسم الدعوة للعمل' : 'Save CTA Section'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'المحتوى العام' : 'General Content'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'محتوى ورسائل الموقع العامة' : 'General website content and messages'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 border-2 border-dashed rounded-lg text-center bg-muted/30">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  {language === 'ar'
                    ? 'إدارة المحتوى العام قريباً...'
                    : 'General content management coming soon...'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'ar'
                    ? 'سيتم إضافة المزيد من خيارات إدارة المحتوى هنا'
                    : 'More content management options will be added here'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Globe, DollarSign, HelpCircle, CheckCircle2 } from 'lucide-react';
import { contentAPI } from '@/lib/api';

// Default English pricing content
const defaultEnglishPricing = {
  hero: {
    badge: 'Simple, Transparent Pricing',
    title: 'Choose the Right Plan for You',
    subtitle: "Whether you're a job seeker, company, or organization, we have a plan that fits your needs. All plans include our core features with no hidden fees.",
    benefit1: 'No hidden fees',
    benefit2: 'Cancel anytime',
    benefit3: '30-day money-back guarantee',
  },
  jobSeeker: {
    name: 'Job Seeker',
    description: 'Perfect for individuals looking for employment opportunities',
    price: 'Free',
    period: '',
    feature1: 'Unlimited job applications',
    feature2: 'Resume upload and management',
    feature3: 'Application tracking',
    feature4: 'Job alerts and notifications',
    feature5: 'Access to all job listings',
    cta: 'Get Started Free',
  },
  company: {
    name: 'Company',
    description: 'Ideal for businesses looking to hire talent',
    price: '$29',
    period: 'month',
    badge: 'Most Popular',
    feature1: '2 free job posts per month',
    feature2: 'Unlimited applications received',
    feature3: 'Advanced application management',
    feature4: 'Company profile with verified badge',
    feature5: 'Analytics and insights',
    feature6: 'Priority customer support',
    cta: 'Start Hiring',
  },
  organization: {
    name: 'Organization',
    description: 'Best for organizations managing tenders and contracts',
    price: '$49',
    period: 'month',
    feature1: '2 free tender posts per month',
    feature2: 'Unlimited proposals received',
    feature3: 'Tender management dashboard',
    feature4: 'Organization profile with verified badge',
    feature5: 'Team collaboration tools',
    feature6: 'Advanced analytics and reporting',
    cta: 'Start Posting',
  },
  comparison: {
    title: 'Feature Comparison',
    subtitle: "See what's included in each plan",
    feature: 'Feature',
    jobSeeker: 'Job Seeker',
    company: 'Company',
    organization: 'Organization',
    row1: { feature: 'Job applications' },
    row2: { feature: 'Resume management' },
    row3: { feature: 'Post jobs' },
    row4: { feature: 'Post tenders' },
    row5: { feature: 'Team collaboration' },
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about our pricing',
    faq1: {
      question: 'Are there any fees for job seekers?',
      answer: 'No, job seekers can use all features completely free. There are no application fees, subscription fees, or hidden charges.',
    },
    faq2: {
      question: 'What happens if I exceed my free posts?',
      answer: 'If you need to post more jobs or tenders than your plan includes, you can purchase additional posts at a discounted rate. Contact our support team for details.',
    },
    faq3: {
      question: 'Can I change my plan later?',
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    faq4: {
      question: 'Do you offer refunds?',
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, contact us for a full refund.",
    },
  },
  cta: {
    title: 'Ready to Get Started?',
    subtitle: 'Join thousands of Syrians who have found success through RT-SYR. Create your free account today and start your journey.',
    button: 'Create Free Account',
    learnMore: 'Learn More',
  },
};

// Default Arabic pricing content
const defaultArabicPricing = {
  hero: {
    badge: 'أسعار بسيطة وشفافة',
    title: 'اختر الخطة المناسبة لك',
    subtitle: 'سواء كنت باحثًا عن عمل، أو شركة، أو منظمة، لدينا خطة تناسب احتياجاتك. جميع الخطط تتضمن ميزاتنا الأساسية بدون رسوم خفية.',
    benefit1: 'بدون رسوم خفية',
    benefit2: 'إلغاء في أي وقت',
    benefit3: 'ضمان استرداد الأموال لمدة 30 يومًا',
  },
  jobSeeker: {
    name: 'باحث عن عمل',
    description: 'مثالي للأفراد الباحثين عن فرص العمل',
    price: 'مجاني',
    period: '',
    feature1: 'طلبات وظائف غير محدودة',
    feature2: 'رفع وإدارة السيرة الذاتية',
    feature3: 'تتبع الطلبات',
    feature4: 'تنبيهات وإشعارات الوظائف',
    feature5: 'الوصول إلى جميع قوائم الوظائف',
    cta: 'ابدأ مجانًا',
  },
  company: {
    name: 'شركة',
    description: 'مثالي للشركات التي تبحث عن توظيف المواهب',
    price: '$29',
    period: 'شهر',
    badge: 'الأكثر شعبية',
    feature1: 'منشوران وظيفيان مجانيان شهريًا',
    feature2: 'طلبات غير محدودة مستلمة',
    feature3: 'إدارة متقدمة للطلبات',
    feature4: 'ملف شركة مع شارة موثوقة',
    feature5: 'التحليلات والرؤى',
    feature6: 'دعم عملاء ذو أولوية',
    cta: 'ابدأ التوظيف',
  },
  organization: {
    name: 'منظمة',
    description: 'الأفضل للمنظمات التي تدير المناقصات والعقود',
    price: '$49',
    period: 'شهر',
    feature1: 'منشوران مناقصيان مجانيان شهريًا',
    feature2: 'عروض غير محدودة مستلمة',
    feature3: 'لوحة تحكم إدارة المناقصات',
    feature4: 'ملف منظمة مع شارة موثوقة',
    feature5: 'أدوات التعاون الجماعي',
    feature6: 'تحليلات وتقارير متقدمة',
    cta: 'ابدأ النشر',
  },
  comparison: {
    title: 'مقارنة الميزات',
    subtitle: 'اطلع على ما هو متضمن في كل خطة',
    feature: 'الميزة',
    jobSeeker: 'باحث عن عمل',
    company: 'شركة',
    organization: 'منظمة',
    row1: { feature: 'طلبات الوظائف' },
    row2: { feature: 'إدارة السيرة الذاتية' },
    row3: { feature: 'نشر الوظائف' },
    row4: { feature: 'نشر المناقصات' },
    row5: { feature: 'التعاون الجماعي' },
  },
  faq: {
    title: 'الأسئلة الشائعة',
    subtitle: 'كل ما تحتاج معرفته عن أسعارنا',
    faq1: {
      question: 'هل توجد رسوم للباحثين عن عمل؟',
      answer: 'لا، يمكن للباحثين عن عمل استخدام جميع الميزات مجانًا تمامًا. لا توجد رسوم طلبات، أو رسوم اشتراك، أو رسوم خفية.',
    },
    faq2: {
      question: 'ماذا يحدث إذا تجاوزت منشوراتي المجانية؟',
      answer: 'إذا كنت بحاجة إلى نشر المزيد من الوظائف أو المناقصات أكثر مما تتضمنه خطتك، يمكنك شراء منشورات إضافية بسعر مخفض. اتصل بفريق الدعم للحصول على التفاصيل.',
    },
    faq3: {
      question: 'هل يمكنني تغيير خطتي لاحقًا؟',
      answer: 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. ستظهر التغييرات في دورة الفوترة التالية.',
    },
    faq4: {
      question: 'هل تقدمون استرداد الأموال؟',
      answer: 'نعم، نقدم ضمان استرداد الأموال لمدة 30 يومًا. إذا لم تكن راضيًا عن خدمتنا، اتصل بنا للحصول على استرداد كامل.',
    },
  },
  cta: {
    title: 'هل أنت مستعد للبدء؟',
    subtitle: 'انضم إلى آلاف السوريين الذين حققوا النجاح من خلال RT-SYR. أنشئ حسابك المجاني اليوم وابدأ رحلتك.',
    button: 'إنشاء حساب مجاني',
    learnMore: 'اعرف المزيد',
  },
};

export function PricingManagement() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('hero');
  // Initialize language from i18n or localStorage
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language') || i18n.language || 'en';
    return savedLang.startsWith('ar') ? 'ar' : 'en';
  });

  // Pricing content state - initialize with default content based on language
  const [pricingContent, setPricingContent] = useState(
    language === 'ar' ? defaultArabicPricing : defaultEnglishPricing
  );

  // Load content from API when language changes
  useEffect(() => {
    const loadContent = async () => {
      // Immediately set default content for the selected language
      const defaultContent = language === 'ar' ? defaultArabicPricing : defaultEnglishPricing;
      setPricingContent(defaultContent);

      try {
        // Try to load saved content from API (non-blocking)
        const pricingContentResult = await contentAPI.getByKey('pricing', language).catch(() => null);

        if (pricingContentResult?.value) {
          const loadedContent = typeof pricingContentResult.value === 'string'
            ? JSON.parse(pricingContentResult.value)
            : pricingContentResult.value;
          setPricingContent(loadedContent);
        }
      } catch (error) {
        // If API fails, keep default content (already set above)
        console.log('Using default pricing content for language:', language);
      }
    };

    loadContent();
  }, [language]);

  const updateContentMutation = useMutation({
    mutationFn: async ({ value }: { value: any }) => {
      try {
        // Try to update first, if it exists
        return await contentAPI.update('pricing', language, {
          key: 'pricing',
          section: 'pricing',
          language,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          type: typeof value === 'string' ? 'text' : 'json',
        });
      } catch (error: any) {
        // If update fails (404), create new content
        if (error.status === 404 || error.isNetworkError) {
          return await contentAPI.create({
            key: 'pricing',
            section: 'pricing',
            language,
            value: typeof value === 'string' ? value : JSON.stringify(value),
            type: typeof value === 'string' ? 'text' : 'json',
          });
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث محتوى الأسعار بنجاح!' : 'Pricing content updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: (error: Error) => {
      toast.error(language === 'ar'
        ? 'فشل تحديث المحتوى. سيتم حفظه محليًا.'
        : error.message || 'Failed to update content. Will save locally.');
    },
  });

  const handleSave = () => {
    updateContentMutation.mutate({ value: pricingContent });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.admin.pricingManagement') || 'Pricing Management'}</h2>
          <p className="text-muted-foreground">
            {t('dashboard.admin.pricingDescription') || 'Manage pricing page content and configurations.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={language}
            onValueChange={(newLang) => {
              setLanguage(newLang);
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
          <Button onClick={handleSave} disabled={updateContentMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateContentMutation.isPending
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
              : (language === 'ar' ? 'حفظ الكل' : 'Save All')}
          </Button>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">
            <DollarSign className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'البطل' : 'Hero'}
          </TabsTrigger>
          <TabsTrigger value="plans">
            <DollarSign className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'الخطط' : 'Plans'}
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'المقارنة' : 'Comparison'}
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="cta">
            <DollarSign className="w-4 h-4 mr-2" />
            CTA
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'قسم البطل' : 'Hero Section'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'محتوى البانر الرئيسي لصفحة الأسعار' : 'Main banner content for pricing page'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نص الشارة' : 'Badge Text'}</Label>
                <Input
                  value={pricingContent.hero.badge}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      hero: { ...pricingContent.hero, badge: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان' : 'Title'}</Label>
                <Input
                  value={pricingContent.hero.title}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      hero: { ...pricingContent.hero, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف' : 'Subtitle'}</Label>
                <Textarea
                  value={pricingContent.hero.subtitle}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      hero: { ...pricingContent.hero, subtitle: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الفائدة 1' : 'Benefit 1'}</Label>
                  <Input
                    value={pricingContent.hero.benefit1}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        hero: { ...pricingContent.hero, benefit1: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الفائدة 2' : 'Benefit 2'}</Label>
                  <Input
                    value={pricingContent.hero.benefit2}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        hero: { ...pricingContent.hero, benefit2: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الفائدة 3' : 'Benefit 3'}</Label>
                  <Input
                    value={pricingContent.hero.benefit3}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        hero: { ...pricingContent.hero, benefit3: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Section */}
        <TabsContent value="plans" className="space-y-4">
          {/* Job Seeker Plan */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'خطة باحث عن عمل' : 'Job Seeker Plan'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                  <Input
                    value={pricingContent.jobSeeker.name}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        jobSeeker: { ...pricingContent.jobSeeker, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'السعر' : 'Price'}</Label>
                  <Input
                    value={pricingContent.jobSeeker.price}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        jobSeeker: { ...pricingContent.jobSeeker, price: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  value={pricingContent.jobSeeker.description}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      jobSeeker: { ...pricingContent.jobSeeker, description: e.target.value },
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نص الزر' : 'CTA Button Text'}</Label>
                <Input
                  value={pricingContent.jobSeeker.cta}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      jobSeeker: { ...pricingContent.jobSeeker, cta: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الميزات' : 'Features'}</Label>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Input
                    key={num}
                    value={pricingContent.jobSeeker[`feature${num}` as keyof typeof pricingContent.jobSeeker] as string}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        jobSeeker: {
                          ...pricingContent.jobSeeker,
                          [`feature${num}`]: e.target.value,
                        },
                      })
                    }
                    placeholder={`${language === 'ar' ? 'الميزة' : 'Feature'} ${num}`}
                    className="mb-2"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Plan */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'خطة الشركة' : 'Company Plan'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                  <Input
                    value={pricingContent.company.name}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        company: { ...pricingContent.company, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'السعر' : 'Price'}</Label>
                  <Input
                    value={pricingContent.company.price}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        company: { ...pricingContent.company, price: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الفترة' : 'Period'}</Label>
                  <Input
                    value={pricingContent.company.period}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        company: { ...pricingContent.company, period: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الشارة' : 'Badge'}</Label>
                  <Input
                    value={pricingContent.company.badge}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        company: { ...pricingContent.company, badge: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نص الزر' : 'CTA Button Text'}</Label>
                  <Input
                    value={pricingContent.company.cta}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        company: { ...pricingContent.company, cta: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  value={pricingContent.company.description}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      company: { ...pricingContent.company, description: e.target.value },
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الميزات' : 'Features'}</Label>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Input
                    key={num}
                    value={pricingContent.company[`feature${num}` as keyof typeof pricingContent.company] as string}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        company: {
                          ...pricingContent.company,
                          [`feature${num}`]: e.target.value,
                        },
                      })
                    }
                    placeholder={`${language === 'ar' ? 'الميزة' : 'Feature'} ${num}`}
                    className="mb-2"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Organization Plan */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'خطة المنظمة' : 'Organization Plan'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                  <Input
                    value={pricingContent.organization.name}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        organization: { ...pricingContent.organization, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'السعر' : 'Price'}</Label>
                  <Input
                    value={pricingContent.organization.price}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        organization: { ...pricingContent.organization, price: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الفترة' : 'Period'}</Label>
                  <Input
                    value={pricingContent.organization.period}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        organization: { ...pricingContent.organization, period: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نص الزر' : 'CTA Button Text'}</Label>
                <Input
                  value={pricingContent.organization.cta}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      organization: { ...pricingContent.organization, cta: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  value={pricingContent.organization.description}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      organization: { ...pricingContent.organization, description: e.target.value },
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الميزات' : 'Features'}</Label>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Input
                    key={num}
                    value={pricingContent.organization[`feature${num}` as keyof typeof pricingContent.organization] as string}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        organization: {
                          ...pricingContent.organization,
                          [`feature${num}`]: e.target.value,
                        },
                      })
                    }
                    placeholder={`${language === 'ar' ? 'الميزة' : 'Feature'} ${num}`}
                    className="mb-2"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Section */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'مقارنة الميزات' : 'Feature Comparison'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان' : 'Title'}</Label>
                  <Input
                    value={pricingContent.comparison.title}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        comparison: { ...pricingContent.comparison, title: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Subtitle'}</Label>
                  <Input
                    value={pricingContent.comparison.subtitle}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        comparison: { ...pricingContent.comparison, subtitle: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'صفوف المقارنة' : 'Comparison Rows'}</Label>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Input
                    key={num}
                    value={pricingContent.comparison[`row${num}` as keyof typeof pricingContent.comparison]?.feature || ''}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        comparison: {
                          ...pricingContent.comparison,
                          [`row${num}`]: { feature: e.target.value },
                        },
                      })
                    }
                    placeholder={`${language === 'ar' ? 'الميزة' : 'Feature'} ${num}`}
                    className="mb-2"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Section */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ Section'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان' : 'Title'}</Label>
                  <Input
                    value={pricingContent.faq.title}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        faq: { ...pricingContent.faq, title: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Subtitle'}</Label>
                  <Input
                    value={pricingContent.faq.subtitle}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        faq: { ...pricingContent.faq, subtitle: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              {[1, 2, 3, 4].map((num) => (
                <Card key={num}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === 'ar' ? `سؤال ${num}` : `FAQ ${num}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'السؤال' : 'Question'}</Label>
                      <Input
                        value={pricingContent.faq[`faq${num}` as keyof typeof pricingContent.faq]?.question || ''}
                        onChange={(e) =>
                          setPricingContent({
                            ...pricingContent,
                            faq: {
                              ...pricingContent.faq,
                              [`faq${num}`]: {
                                ...(pricingContent.faq[`faq${num}` as keyof typeof pricingContent.faq] as any),
                                question: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الإجابة' : 'Answer'}</Label>
                      <Textarea
                        value={pricingContent.faq[`faq${num}` as keyof typeof pricingContent.faq]?.answer || ''}
                        onChange={(e) =>
                          setPricingContent({
                            ...pricingContent,
                            faq: {
                              ...pricingContent.faq,
                              [`faq${num}`]: {
                                ...(pricingContent.faq[`faq${num}` as keyof typeof pricingContent.faq] as any),
                                answer: e.target.value,
                              },
                            },
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Section */}
        <TabsContent value="cta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'قسم الدعوة للعمل' : 'Call to Action Section'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان' : 'Title'}</Label>
                <Input
                  value={pricingContent.cta.title}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      cta: { ...pricingContent.cta, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف' : 'Subtitle'}</Label>
                <Textarea
                  value={pricingContent.cta.subtitle}
                  onChange={(e) =>
                    setPricingContent({
                      ...pricingContent,
                      cta: { ...pricingContent.cta, subtitle: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نص الزر الرئيسي' : 'Primary Button Text'}</Label>
                  <Input
                    value={pricingContent.cta.button}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        cta: { ...pricingContent.cta, button: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نص الزر الثانوي' : 'Secondary Button Text'}</Label>
                  <Input
                    value={pricingContent.cta.learnMore}
                    onChange={(e) =>
                      setPricingContent({
                        ...pricingContent,
                        cta: { ...pricingContent.cta, learnMore: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}






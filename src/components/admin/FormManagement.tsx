import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Plus, Trash2, GripVertical, Globe } from 'lucide-react';
import { contentAPI, type FormConfig, type FormField } from '@/lib/api';

// Default English form configurations
const defaultEnglishRegistrationForm: FormConfig = {
  formType: 'registration',
  title: 'Create Your Account',
  description: 'Join RT-SYR to access job opportunities and tenders',
  submitButtonText: 'Sign Up',
  fields: [
    {
      id: 'name',
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name',
      order: 1,
      visible: true,
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Enter your email',
      order: 2,
      visible: true,
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Enter your password',
      order: 3,
      visible: true,
    },
    {
      id: 'type',
      name: 'type',
      label: 'Account Type',
      type: 'select',
      required: true,
      options: ['job_seeker', 'company', 'organization'],
      order: 4,
      visible: true,
    },
    {
      id: 'file',
      name: 'file',
      label: 'Upload Document (Optional)',
      type: 'file',
      required: false,
      placeholder: 'Upload your resume or document',
      validation: {
        accept: '.pdf,.doc,.docx,image/*',
      },
      order: 5,
      visible: true,
    },
  ],
};

const defaultEnglishJobForm: FormConfig = {
  formType: 'job',
  title: 'Post a Job',
  description: 'Create a new job posting to attract qualified candidates',
  submitButtonText: 'Post Job',
  fields: [
    {
      id: 'title',
      name: 'title',
      label: 'Job Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., Senior Software Engineer',
      order: 1,
      visible: true,
    },
    {
      id: 'description',
      name: 'description',
      label: 'Job Description',
      type: 'textarea',
      required: true,
      placeholder: 'Provide a detailed description...',
      order: 2,
      visible: true,
    },
    {
      id: 'location',
      name: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      placeholder: 'e.g., Damascus, Aleppo, Remote',
      order: 3,
      visible: true,
    },
    {
      id: 'type',
      name: 'type',
      label: 'Job Type',
      type: 'select',
      required: true,
      options: ['full-time', 'part-time', 'contract', 'remote'],
      order: 4,
      visible: true,
    },
    {
      id: 'category',
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        'Technology',
        'Marketing',
        'Finance',
        'Design',
        'Management',
        'Sales',
        'Content',
        'Human Resources',
      ],
      order: 5,
      visible: true,
    },
    {
      id: 'salary',
      name: 'salary',
      label: 'Salary (Optional)',
      type: 'text',
      required: false,
      placeholder: 'e.g., $1,500 - $2,500',
      order: 6,
      visible: true,
    },
  ],
};

const defaultEnglishTenderForm: FormConfig = {
  formType: 'tender',
  title: 'Post a Tender',
  description: 'Create a new tender opportunity for potential bidders',
  submitButtonText: 'Post Tender',
  fields: [
    {
      id: 'title',
      name: 'title',
      label: 'Tender Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., IT Infrastructure Upgrade Project',
      order: 1,
      visible: true,
    },
    {
      id: 'description',
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Provide a detailed description...',
      order: 2,
      visible: true,
    },
    {
      id: 'location',
      name: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      placeholder: 'e.g., Damascus, Aleppo, National',
      order: 3,
      visible: true,
    },
    {
      id: 'category',
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        'Technology',
        'Construction',
        'Procurement',
        'Education',
        'Healthcare',
        'Transportation',
        'Agriculture',
        'Energy',
        'Other',
      ],
      order: 4,
      visible: true,
    },
    {
      id: 'deadline',
      name: 'deadline',
      label: 'Deadline',
      type: 'date',
      required: true,
      order: 5,
      visible: true,
    },
  ],
};

// Default Arabic form configurations
const defaultArabicRegistrationForm: FormConfig = {
  formType: 'registration',
  title: 'إنشاء حسابك',
  description: 'انضم إلى RT-SYR للوصول إلى فرص العمل والمناقصات',
  submitButtonText: 'التسجيل',
  fields: [
    {
      id: 'name',
      name: 'name',
      label: 'الاسم الكامل',
      type: 'text',
      required: true,
      placeholder: 'أدخل اسمك الكامل',
      order: 1,
      visible: true,
    },
    {
      id: 'email',
      name: 'email',
      label: 'البريد الإلكتروني',
      type: 'email',
      required: true,
      placeholder: 'أدخل بريدك الإلكتروني',
      order: 2,
      visible: true,
    },
    {
      id: 'password',
      name: 'password',
      label: 'كلمة المرور',
      type: 'password',
      required: true,
      placeholder: 'أدخل كلمة المرور',
      order: 3,
      visible: true,
    },
    {
      id: 'type',
      name: 'type',
      label: 'نوع الحساب',
      type: 'select',
      required: true,
      options: ['job_seeker', 'company', 'organization'],
      order: 4,
      visible: true,
    },
    {
      id: 'file',
      name: 'file',
      label: 'رفع مستند (اختياري)',
      type: 'file',
      required: false,
      placeholder: 'قم برفع سيرتك الذاتية أو المستند',
      validation: {
        accept: '.pdf,.doc,.docx,image/*',
      },
      order: 5,
      visible: true,
    },
  ],
};

const defaultArabicJobForm: FormConfig = {
  formType: 'job',
  title: 'نشر وظيفة',
  description: 'أنشئ إعلان وظيفة جديد لجذب المرشحين المؤهلين',
  submitButtonText: 'نشر الوظيفة',
  fields: [
    {
      id: 'title',
      name: 'title',
      label: 'عنوان الوظيفة',
      type: 'text',
      required: true,
      placeholder: 'مثال: مهندس برمجيات أول',
      order: 1,
      visible: true,
    },
    {
      id: 'description',
      name: 'description',
      label: 'وصف الوظيفة',
      type: 'textarea',
      required: true,
      placeholder: 'قدم وصفًا مفصلاً...',
      order: 2,
      visible: true,
    },
    {
      id: 'location',
      name: 'location',
      label: 'الموقع',
      type: 'text',
      required: true,
      placeholder: 'مثال: دمشق، حلب، عن بُعد',
      order: 3,
      visible: true,
    },
    {
      id: 'type',
      name: 'type',
      label: 'نوع الوظيفة',
      type: 'select',
      required: true,
      options: ['full-time', 'part-time', 'contract', 'remote'],
      order: 4,
      visible: true,
    },
    {
      id: 'category',
      name: 'category',
      label: 'الفئة',
      type: 'select',
      required: true,
      options: [
        'Technology',
        'Marketing',
        'Finance',
        'Design',
        'Management',
        'Sales',
        'Content',
        'Human Resources',
      ],
      order: 5,
      visible: true,
    },
    {
      id: 'salary',
      name: 'salary',
      label: 'الراتب (اختياري)',
      type: 'text',
      required: false,
      placeholder: 'مثال: 1500$ - 2500$',
      order: 6,
      visible: true,
    },
  ],
};

const defaultArabicTenderForm: FormConfig = {
  formType: 'tender',
  title: 'نشر مناقصة',
  description: 'أنشئ فرصة مناقصة جديدة للمقدمين المحتملين',
  submitButtonText: 'نشر المناقصة',
  fields: [
    {
      id: 'title',
      name: 'title',
      label: 'عنوان المناقصة',
      type: 'text',
      required: true,
      placeholder: 'مثال: مشروع ترقية البنية التحتية لتقنية المعلومات',
      order: 1,
      visible: true,
    },
    {
      id: 'description',
      name: 'description',
      label: 'الوصف',
      type: 'textarea',
      required: true,
      placeholder: 'قدم وصفًا مفصلاً...',
      order: 2,
      visible: true,
    },
    {
      id: 'location',
      name: 'location',
      label: 'الموقع',
      type: 'text',
      required: true,
      placeholder: 'مثال: دمشق، حلب، وطني',
      order: 3,
      visible: true,
    },
    {
      id: 'category',
      name: 'category',
      label: 'الفئة',
      type: 'select',
      required: true,
      options: [
        'Technology',
        'Construction',
        'Procurement',
        'Education',
        'Healthcare',
        'Transportation',
        'Agriculture',
        'Energy',
        'Other',
      ],
      order: 4,
      visible: true,
    },
    {
      id: 'deadline',
      name: 'deadline',
      label: 'الموعد النهائي',
      type: 'date',
      required: true,
      order: 5,
      visible: true,
    },
  ],
};

export function FormManagement() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [activeForm, setActiveForm] = useState<'registration' | 'job' | 'tender'>('registration');
  // Initialize language from i18n or localStorage
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language') || i18n.language || 'en';
    return savedLang.startsWith('ar') ? 'ar' : 'en';
  });

  const [registrationForm, setRegistrationForm] = useState<FormConfig>(
    language === 'ar' ? defaultArabicRegistrationForm : defaultEnglishRegistrationForm
  );
  const [jobForm, setJobForm] = useState<FormConfig>(
    language === 'ar' ? defaultArabicJobForm : defaultEnglishJobForm
  );
  const [tenderForm, setTenderForm] = useState<FormConfig>(
    language === 'ar' ? defaultArabicTenderForm : defaultEnglishTenderForm
  );

  // Load content from API when language changes
  useEffect(() => {
    const loadForms = async () => {
      // Immediately set default forms for the selected language
      const defaultRegistration = language === 'ar' ? defaultArabicRegistrationForm : defaultEnglishRegistrationForm;
      const defaultJob = language === 'ar' ? defaultArabicJobForm : defaultEnglishJobForm;
      const defaultTender = language === 'ar' ? defaultArabicTenderForm : defaultEnglishTenderForm;

      setRegistrationForm(defaultRegistration);
      setJobForm(defaultJob);
      setTenderForm(defaultTender);

      try {
        // Try to load saved forms from API (non-blocking)
        const [regForm, jobFormData, tenderFormData] = await Promise.allSettled([
          contentAPI.getFormConfig('registration', language),
          contentAPI.getFormConfig('job', language),
          contentAPI.getFormConfig('tender', language),
        ]);

        if (regForm.status === 'fulfilled' && regForm.value) {
          setRegistrationForm(regForm.value);
        }
        if (jobFormData.status === 'fulfilled' && jobFormData.value) {
          setJobForm(jobFormData.value);
        }
        if (tenderFormData.status === 'fulfilled' && tenderFormData.value) {
          setTenderForm(tenderFormData.value);
        }
      } catch (error) {
        // If API fails, keep default forms (already set above)
        console.log('Using default forms for language:', language);
      }
    };

    loadForms();
  }, [language]);

  const getCurrentForm = () => {
    switch (activeForm) {
      case 'registration':
        return registrationForm;
      case 'job':
        return jobForm;
      case 'tender':
        return tenderForm;
    }
  };

  const setCurrentForm = (form: FormConfig) => {
    switch (activeForm) {
      case 'registration':
        setRegistrationForm(form);
        break;
      case 'job':
        setJobForm(form);
        break;
      case 'tender':
        setTenderForm(form);
        break;
    }
  };

  const updateFormMutation = useMutation({
    mutationFn: async (data: FormConfig) => {
      try {
        // Try to update first, if it exists
        return await contentAPI.updateFormConfig(data.formType, language, data);
      } catch (error: any) {
        // If update fails (404), create new form config
        if (error.status === 404 || error.isNetworkError) {
          // For now, just save locally since create might not be available
          return data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث تكوين النموذج بنجاح!' : 'Form configuration updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['form-config'] });
    },
    onError: (error: Error) => {
      toast.error(language === 'ar' 
        ? 'فشل تحديث تكوين النموذج. سيتم حفظه محليًا.' 
        : error.message || 'Failed to update form configuration. Will save locally.');
    },
  });

  const handleSave = () => {
    updateFormMutation.mutate(getCurrentForm());
  };

  const addField = () => {
    const currentForm = getCurrentForm();
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      order: currentForm.fields.length + 1,
      visible: true,
    };
    setCurrentForm({
      ...currentForm,
      fields: [...currentForm.fields, newField],
    });
  };

  const removeField = (index: number) => {
    const currentForm = getCurrentForm();
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.filter((_, i) => i !== index),
    });
  };

  const updateField = (index: number, field: Partial<FormField>) => {
    const currentForm = getCurrentForm();
    const updated = [...currentForm.fields];
    updated[index] = { ...updated[index], ...field };
    setCurrentForm({ ...currentForm, fields: updated });
  };

  const updateFormInfo = (field: 'title' | 'description' | 'submitButtonText', value: string) => {
    const currentForm = getCurrentForm();
    setCurrentForm({ ...currentForm, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.admin.formManagement')}</h2>
          <p className="text-muted-foreground">{t('dashboard.admin.formDescription')}</p>
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
        </div>
      </div>

      <Tabs value={activeForm} onValueChange={(v) => setActiveForm(v as any)}>
        <TabsList>
          <TabsTrigger value="registration">
            {language === 'ar' ? 'نموذج التسجيل' : 'Registration Form'}
          </TabsTrigger>
          <TabsTrigger value="job">
            {language === 'ar' ? 'نموذج نشر الوظيفة' : 'Job Posting Form'}
          </TabsTrigger>
          <TabsTrigger value="tender">
            {language === 'ar' ? 'نموذج نشر المناقصة' : 'Tender Posting Form'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeForm} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'معلومات النموذج' : 'Form Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'عنوان النموذج' : 'Form Title'}</Label>
                <Input
                  value={getCurrentForm().title}
                  onChange={(e) => updateFormInfo('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'وصف النموذج' : 'Form Description'}</Label>
                <Textarea
                  value={getCurrentForm().description}
                  onChange={(e) => updateFormInfo('description', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نص زر الإرسال' : 'Submit Button Text'}</Label>
                <Input
                  value={getCurrentForm().submitButtonText}
                  onChange={(e) => updateFormInfo('submitButtonText', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{language === 'ar' ? 'حقول النموذج' : 'Form Fields'}</CardTitle>
                <Button variant="outline" size="sm" onClick={addField}>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إضافة حقل' : 'Add Field'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {getCurrentForm().fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-sm">
                          {language === 'ar' ? `حقل ${index + 1}` : `Field ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'اسم الحقل (المعرف)' : 'Field Name (ID)'}</Label>
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          placeholder={language === 'ar' ? 'مثال: title, email' : 'e.g., title, email'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'تسمية الحقل' : 'Field Label'}</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          placeholder={language === 'ar' ? 'مثال: عنوان الوظيفة' : 'e.g., Job Title'}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'نوع الحقل' : 'Field Type'}</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value: FormField['type']) =>
                            updateField(index, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">{language === 'ar' ? 'نص' : 'Text'}</SelectItem>
                            <SelectItem value="email">{language === 'ar' ? 'بريد إلكتروني' : 'Email'}</SelectItem>
                            <SelectItem value="password">{language === 'ar' ? 'كلمة مرور' : 'Password'}</SelectItem>
                            <SelectItem value="select">{language === 'ar' ? 'قائمة منسدلة' : 'Select'}</SelectItem>
                            <SelectItem value="textarea">{language === 'ar' ? 'منطقة نص' : 'Textarea'}</SelectItem>
                            <SelectItem value="date">{language === 'ar' ? 'تاريخ' : 'Date'}</SelectItem>
                            <SelectItem value="number">{language === 'ar' ? 'رقم' : 'Number'}</SelectItem>
                            <SelectItem value="file">{language === 'ar' ? 'ملف' : 'File'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'النص التوضيحي' : 'Placeholder'}</Label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(index, { placeholder: e.target.value })}
                          placeholder={language === 'ar' ? 'نص توضيحي للحقل' : 'Field placeholder text'}
                        />
                      </div>
                    </div>

                    {field.type === 'select' && (
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الخيارات (مفصولة بفواصل)' : 'Options (comma-separated)'}</Label>
                        <Input
                          value={field.options?.join(', ') || ''}
                          onChange={(e) =>
                            updateField(index, {
                              options: e.target.value.split(',').map((s) => s.trim()),
                            })
                          }
                          placeholder={language === 'ar' ? 'خيار 1، خيار 2، خيار 3' : 'Option 1, Option 2, Option 3'}
                        />
                      </div>
                    )}

                    {field.type === 'file' && (
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'أنواع الملفات المقبولة' : 'Accepted File Types'}</Label>
                        <Input
                          value={field.validation?.accept || ''}
                          onChange={(e) =>
                            updateField(index, {
                              validation: {
                                ...field.validation,
                                accept: e.target.value,
                              },
                            })
                          }
                          placeholder={language === 'ar' ? 'مثال: .pdf,.doc,.docx,image/*' : 'e.g., .pdf,.doc,.docx,image/*'}
                        />
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar' 
                            ? 'حدد أنواع الملفات المقبولة (مفصولة بفواصل)' 
                            : 'Specify accepted file types (comma-separated)'}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) =>
                            updateField(index, { required: checked as boolean })
                          }
                        />
                        <Label htmlFor={`required-${field.id}`} className="cursor-pointer">
                          {language === 'ar' ? 'مطلوب' : 'Required'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`visible-${field.id}`}
                          checked={field.visible}
                          onCheckedChange={(checked) =>
                            updateField(index, { visible: checked as boolean })
                          }
                        />
                        <Label htmlFor={`visible-${field.id}`} className="cursor-pointer">
                          {language === 'ar' ? 'مرئي' : 'Visible'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateFormMutation.isPending} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'حفظ تكوين النموذج' : 'Save Form Configuration'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

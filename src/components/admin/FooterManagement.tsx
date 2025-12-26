import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Globe } from 'lucide-react';
import { contentAPI, type FooterContent } from '@/lib/api';

export function FooterManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState('en');
  const [footerContent, setFooterContent] = useState<FooterContent>({
    description: 'Connect with reputable companies and discover authentic tender opportunities across Syria.',
    contactEmail: 'contact@rt-syr.com',
    contactLocation: 'Damascus, Syria',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      linkedin: '#',
      instagram: '#',
    },
    platformLinks: [
      { name: 'Browse Jobs', href: '/jobs' },
      { name: 'Browse Tenders', href: '/tenders' },
      { name: 'For Companies', href: '/signup?type=company' },
      { name: 'For Organizations', href: '/signup?type=organization' },
    ],
    supportLinks: [
      { name: 'About Us', href: '/about' },
      { name: 'Report Issue', href: '/report' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    copyright: 'All rights reserved.',
    hashtags: {
      jobs: '#SyrianJobs',
      tenders: '#SyrianTenders',
    },
  });

  const updateFooterMutation = useMutation({
    mutationFn: async (data: FooterContent) => {
      return await contentAPI.updateFooter(language, data);
    },
    onSuccess: () => {
      toast.success('Footer content updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['footer'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update footer');
    },
  });

  const handleSave = () => {
    updateFooterMutation.mutate(footerContent);
  };

  const addPlatformLink = () => {
    setFooterContent({
      ...footerContent,
      platformLinks: [...footerContent.platformLinks, { name: '', href: '' }],
    });
  };

  const removePlatformLink = (index: number) => {
    setFooterContent({
      ...footerContent,
      platformLinks: footerContent.platformLinks.filter((_, i) => i !== index),
    });
  };

  const updatePlatformLink = (index: number, field: 'name' | 'href', value: string) => {
    const updated = [...footerContent.platformLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFooterContent({ ...footerContent, platformLinks: updated });
  };

  const addSupportLink = () => {
    setFooterContent({
      ...footerContent,
      supportLinks: [...footerContent.supportLinks, { name: '', href: '' }],
    });
  };

  const removeSupportLink = (index: number) => {
    setFooterContent({
      ...footerContent,
      supportLinks: footerContent.supportLinks.filter((_, i) => i !== index),
    });
  };

  const updateSupportLink = (index: number, field: 'name' | 'href', value: string) => {
    const updated = [...footerContent.supportLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFooterContent({ ...footerContent, supportLinks: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.admin.footerManagement')}</h2>
          <p className="text-muted-foreground">{t('dashboard.admin.footerDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
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

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={footerContent.description}
              onChange={(e) =>
                setFooterContent({ ...footerContent, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={footerContent.contactEmail}
                onChange={(e) =>
                  setFooterContent({ ...footerContent, contactEmail: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Location</Label>
              <Input
                value={footerContent.contactLocation}
                onChange={(e) =>
                  setFooterContent({ ...footerContent, contactLocation: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input
                value={footerContent.socialLinks.facebook || ''}
                onChange={(e) =>
                  setFooterContent({
                    ...footerContent,
                    socialLinks: { ...footerContent.socialLinks, facebook: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter URL</Label>
              <Input
                value={footerContent.socialLinks.twitter || ''}
                onChange={(e) =>
                  setFooterContent({
                    ...footerContent,
                    socialLinks: { ...footerContent.socialLinks, twitter: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={footerContent.socialLinks.linkedin || ''}
                onChange={(e) =>
                  setFooterContent({
                    ...footerContent,
                    socialLinks: { ...footerContent.socialLinks, linkedin: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input
                value={footerContent.socialLinks.instagram || ''}
                onChange={(e) =>
                  setFooterContent({
                    ...footerContent,
                    socialLinks: { ...footerContent.socialLinks, instagram: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Platform Links</CardTitle>
            <Button variant="outline" size="sm" onClick={addPlatformLink}>
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {footerContent.platformLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label>Link Name</Label>
                <Input
                  value={link.name}
                  onChange={(e) => updatePlatformLink(index, 'name', e.target.value)}
                  placeholder="Link name"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>URL</Label>
                <Input
                  value={link.href}
                  onChange={(e) => updatePlatformLink(index, 'href', e.target.value)}
                  placeholder="/path"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removePlatformLink(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Support Links</CardTitle>
            <Button variant="outline" size="sm" onClick={addSupportLink}>
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {footerContent.supportLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label>Link Name</Label>
                <Input
                  value={link.name}
                  onChange={(e) => updateSupportLink(index, 'name', e.target.value)}
                  placeholder="Link name"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>URL</Label>
                <Input
                  value={link.href}
                  onChange={(e) => updateSupportLink(index, 'href', e.target.value)}
                  placeholder="/path"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeSupportLink(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Copyright Text</Label>
            <Input
              value={footerContent.copyright}
              onChange={(e) =>
                setFooterContent({ ...footerContent, copyright: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jobs Hashtag</Label>
              <Input
                value={footerContent.hashtags.jobs}
                onChange={(e) =>
                  setFooterContent({
                    ...footerContent,
                    hashtags: { ...footerContent.hashtags, jobs: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tenders Hashtag</Label>
              <Input
                value={footerContent.hashtags.tenders}
                onChange={(e) =>
                  setFooterContent({
                    ...footerContent,
                    hashtags: { ...footerContent.hashtags, tenders: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateFooterMutation.isPending} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save All Footer Changes
        </Button>
      </div>
    </div>
  );
}


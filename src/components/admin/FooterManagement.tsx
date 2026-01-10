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
    socialIcons: {
      facebook: 'facebook',
      twitter: 'twitter',
      linkedin: 'linkedin',
      instagram: 'instagram',
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
          <CardTitle>Social Media Links & Icons</CardTitle>
          <CardDescription>Manage social media links and icon types for the footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok', 'whatsapp'] as const).map((platform) => (
            <div key={platform} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label className="capitalize">{platform} URL</Label>
                <Input
                  type="url"
                  placeholder={`https://${platform}.com/...`}
                  value={footerContent.socialLinks[platform] || ''}
                  onChange={(e) =>
                    setFooterContent({
                      ...footerContent,
                      socialLinks: { ...footerContent.socialLinks, [platform]: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="capitalize">{platform} Icon Type</Label>
                <Select
                  value={footerContent.socialIcons?.[platform] || platform}
                  onValueChange={(value) =>
                    setFooterContent({
                      ...footerContent,
                      socialIcons: { ...(footerContent.socialIcons || {}), [platform]: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSocialLinks = { ...footerContent.socialLinks };
                    delete newSocialLinks[platform];
                    const newSocialIcons = { ...(footerContent.socialIcons || {}) };
                    delete newSocialIcons[platform];
                    setFooterContent({
                      ...footerContent,
                      socialLinks: newSocialLinks,
                      socialIcons: newSocialIcons,
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              // Add a new social media platform
              setFooterContent({
                ...footerContent,
                socialLinks: { ...footerContent.socialLinks, youtube: '' },
              });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Social Media Platform
          </Button>
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


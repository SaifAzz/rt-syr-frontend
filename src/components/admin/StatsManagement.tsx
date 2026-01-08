import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, Users, Building2, FileText, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getHomeStats, setHomeStats, type HomeStats, formatStatValue } from '@/lib/utils';

export function StatsManagement() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<HomeStats>(getHomeStats());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStats(getHomeStats());
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      setHomeStats(stats);
      // Dispatch custom event to update stats in real-time
      window.dispatchEvent(new Event('homeStatsUpdated'));
      toast.success('Stats updated successfully');
    } catch (error) {
      toast.error('Failed to save stats');
      console.error('Error saving stats:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultStats: HomeStats = {
      activeOpportunities: 0,
      registeredUsers: 0,
      verifiedCompanies: 0,
      organizations: 0,
    };
    setStats(defaultStats);
  };

  const statFields = [
    {
      key: 'activeOpportunities' as keyof HomeStats,
      label: 'Active Opportunities',
      description: 'Number of active jobs and tenders',
      icon: Briefcase,
    },
    {
      key: 'registeredUsers' as keyof HomeStats,
      label: 'Registered Users',
      description: 'Number of registered job seekers',
      icon: Users,
    },
    {
      key: 'verifiedCompanies' as keyof HomeStats,
      label: 'Verified Companies',
      description: 'Number of verified companies',
      icon: Building2,
    },
    {
      key: 'organizations' as keyof HomeStats,
      label: 'Organizations',
      description: 'Number of organizations',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Homepage Statistics Management</h2>
        <p className="text-muted-foreground mt-1">
          Manage the statistics displayed on the homepage. Changes are saved locally and displayed immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Statistics</CardTitle>
          <CardDescription>
            Update the numbers displayed in the stats section on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {field.label}
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    min="0"
                    value={stats[field.key]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setStats({ ...stats, [field.key]: value });
                    }}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                  <div className="text-sm text-muted-foreground">
                    Preview: <span className="font-semibold">{formatStatValue(stats[field.key])}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset to Zero
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How the stats will appear on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statFields.map((field) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.key}
                  className="text-center p-4 rounded-lg bg-muted border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {formatStatValue(stats[field.key])}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {field.label}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}















import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard, type Job } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jobsAPI, type JobRecord } from "@/lib/api";
import { 
  Search, 
  MapPin, 
  Filter,
  Briefcase,
  Building2,
  X,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function to map JobRecord to Job
const mapJobRecordToJob = (jobRecord: JobRecord): Job => {
  // Format salary
  let salary: string | undefined;
  if (jobRecord.salary_min && jobRecord.salary_max) {
    salary = `$${jobRecord.salary_min.toLocaleString()} - $${jobRecord.salary_max.toLocaleString()}`;
  } else if (jobRecord.salary_min) {
    salary = `From $${jobRecord.salary_min.toLocaleString()}`;
  } else if (jobRecord.salary_max) {
    salary = `Up to $${jobRecord.salary_max.toLocaleString()}`;
  }

  // Format posted date
  const postedAt = jobRecord.created_at 
    ? formatDistanceToNow(new Date(jobRecord.created_at), { addSuffix: true })
    : "Recently";

  // Map employment type
  const type = (jobRecord.employment_type || jobRecord.type || "full-time") as Job["type"];

  return {
    id: jobRecord.id,
    title: jobRecord.title,
    company: (jobRecord as any).company?.name || "Company", // API might include company info
    companyLogo: (jobRecord as any).company?.logo_url,
    location: jobRecord.location || "Not specified",
    salary,
    type,
    category: jobRecord.category || "General",
    postedAt,
    isVerified: jobRecord.status === "open" || jobRecord.status === "active",
  };
};

const Jobs = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t('jobs.allCategories'));
  const [selectedLocation, setSelectedLocation] = useState(t('jobs.allLocations'));

  // Fetch jobs from API
  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const result = await jobsAPI.getAll();
      return Array.isArray(result) ? result : result.data || [];
    },
  });

  const jobs: Job[] = useMemo(() => {
    if (!jobsData) return [];
    return jobsData.map(mapJobRecordToJob);
  }, [jobsData]);

  // Extract unique categories and locations from jobs
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    jobs.forEach(job => {
      if (job.category) uniqueCategories.add(job.category);
    });
    return [t('jobs.allCategories'), ...Array.from(uniqueCategories).sort()];
  }, [jobs, t]);

  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    jobs.forEach(job => {
      if (job.location) uniqueLocations.add(job.location);
    });
    return [t('jobs.allLocations'), ...Array.from(uniqueLocations).sort()];
  }, [jobs, t]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === t('jobs.allCategories') || job.category === selectedCategory;
    const matchesLocation = 
      selectedLocation === t('jobs.allLocations') || job.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(t('jobs.allCategories'));
    setSelectedLocation(t('jobs.allLocations'));
  };

  const hasFilters = searchQuery || selectedCategory !== t('jobs.allCategories') || selectedLocation !== t('jobs.allLocations');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Header */}
        <section className="bg-gradient-hero py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t('jobs.title')} <span className="text-gradient-primary">{t('jobs.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('jobs.subtitle', { count: jobs.length })}
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-card sticky top-16 z-40">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t('jobs.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t('jobs.category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full lg:w-48">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t('jobs.location')} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  {t('common.clear')}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Job listings */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {t('jobs.showing')} <span className="font-semibold text-foreground">{filteredJobs.length}</span> {t('jobs.jobs')}
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">{t('common.loading') || 'Loading jobs...'}</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Error loading jobs</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Failed to load jobs. Please try again later.'}
                </p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('jobs.noJobsFound')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('jobs.noJobsDescription')}
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  {t('jobs.clearAllFilters')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;

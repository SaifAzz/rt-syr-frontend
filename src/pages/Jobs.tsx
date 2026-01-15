import { useState, useMemo, useEffect } from "react";
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
const mapJobRecordToJob = (jobRecord: JobRecord, isArabic: boolean): Job => {
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

  // Map employment type - use Arabic if available
  let typeValue = jobRecord.employment_type || jobRecord.type || "full-time";
  if (isArabic && jobRecord.employment_type_ar) {
    // Keep the value as is for filtering, but we'll display the Arabic text
    typeValue = jobRecord.employment_type || jobRecord.type || "full-time";
  }
  const type = typeValue as Job["type"];

  // Display Arabic fields when in Arabic mode, English fields when in English mode
  // If Arabic field is missing, fallback to English
  const title = isArabic
    ? (jobRecord.title_ar || jobRecord.title || "No title")
    : jobRecord.title || "No title";
  const location = isArabic
    ? (jobRecord.location_ar || jobRecord.location || "Not specified")
    : (jobRecord.location || "Not specified");
  const category = isArabic
    ? (jobRecord.category_ar || jobRecord.category || "General")
    : (jobRecord.category || "General");

  return {
    id: jobRecord.id,
    title,
    company: (jobRecord as any).company?.name || "Company", // API might include company info
    companyLogo: (jobRecord as any).company?.logo_url,
    location,
    salary,
    type,
    category,
    postedAt,
    isVerified: jobRecord.status === "open" || jobRecord.status === "active",
    userRole: (jobRecord as any).user_role as "user" | "company" | "organization" | "admin" | undefined,
    // Store original record for search purposes
    _originalRecord: jobRecord,
  };
};

const Jobs = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
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

  const jobs: (Job & { _originalRecord?: JobRecord })[] = useMemo(() => {
    if (!jobsData) return [];
    return jobsData.map(record => mapJobRecordToJob(record, isArabic));
  }, [jobsData, isArabic]);

  // Reset filters when language changes
  useEffect(() => {
    setSelectedCategory(t('jobs.allCategories'));
    setSelectedLocation(t('jobs.allLocations'));
  }, [isArabic, t]);

  // Extract unique categories and locations from jobs (both English and Arabic)
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    jobs.forEach(job => {
      if (job.category) uniqueCategories.add(job.category);
      // Also include Arabic category if available
      if (job._originalRecord?.category_ar) uniqueCategories.add(job._originalRecord.category_ar);
      // Also include English category for filtering
      if (job._originalRecord?.category) uniqueCategories.add(job._originalRecord.category);
    });
    return [t('jobs.allCategories'), ...Array.from(uniqueCategories).sort()];
  }, [jobs, t]);

  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    jobs.forEach(job => {
      if (job.location) uniqueLocations.add(job.location);
      // Also include Arabic location if available
      if (job._originalRecord?.location_ar) uniqueLocations.add(job._originalRecord.location_ar);
      // Also include English location for filtering
      if (job._originalRecord?.location) uniqueLocations.add(job._originalRecord.location);
    });
    return [t('jobs.allLocations'), ...Array.from(uniqueLocations).sort()];
  }, [jobs, t]);

  const filteredJobs = jobs.filter((job) => {
    const record = job._originalRecord;
    if (!record) return false;

    // Search in both English and Arabic fields
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      (job.title && job.title.toLowerCase().includes(searchLower)) ||
      (record.title_ar && record.title_ar.toLowerCase().includes(searchLower)) ||
      (record.title && record.title.toLowerCase().includes(searchLower)) ||
      (job.company && job.company.toLowerCase().includes(searchLower)) ||
      (record.description && record.description.toLowerCase().includes(searchLower)) ||
      (record.description_ar && record.description_ar.toLowerCase().includes(searchLower)) ||
      (record.requirements && record.requirements.toLowerCase().includes(searchLower)) ||
      (record.requirements_ar && record.requirements_ar.toLowerCase().includes(searchLower));

    // Category matching - check both displayed category and original categories
    const allCategoriesLabel = t('jobs.allCategories');
    // If "All Categories" is selected (in current language), match all
    const matchesCategory = 
      selectedCategory === allCategoriesLabel || 
      // Check if selectedCategory matches any of the category fields
      job.category === selectedCategory ||
      record.category === selectedCategory ||
      record.category_ar === selectedCategory;

    // Location matching - check both displayed location and original locations
    const allLocationsLabel = t('jobs.allLocations');
    // If "All Locations" is selected (in current language), match all
    const matchesLocation = 
      selectedLocation === allLocationsLabel || 
      // Check if selectedLocation matches any of the location fields
      job.location === selectedLocation ||
      record.location === selectedLocation ||
      record.location_ar === selectedLocation;
    
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
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('jobs.errorLoadingJobs')}</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : t('jobs.failedToLoadJobs')}
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

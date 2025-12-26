import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard, type Job } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Filter,
  Briefcase,
  Building2,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data
const sampleJobs: Job[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "Tech Solutions Syria",
    location: "Damascus",
    salary: "$1,500 - $2,500",
    type: "full-time",
    category: "Technology",
    postedAt: "2 days ago",
    isVerified: true,
  },
  {
    id: "2",
    title: "Marketing Manager",
    company: "Global Marketing Co.",
    location: "Aleppo",
    salary: "$1,200 - $1,800",
    type: "full-time",
    category: "Marketing",
    postedAt: "3 days ago",
    isVerified: true,
  },
  {
    id: "3",
    title: "Accountant",
    company: "Financial Services Ltd",
    location: "Homs",
    salary: "$800 - $1,200",
    type: "full-time",
    category: "Finance",
    postedAt: "1 week ago",
    isVerified: true,
  },
  {
    id: "4",
    title: "UI/UX Designer",
    company: "Creative Agency",
    location: "Damascus",
    salary: "$1,000 - $1,500",
    type: "remote",
    category: "Design",
    postedAt: "4 days ago",
    isVerified: true,
  },
  {
    id: "5",
    title: "Project Manager",
    company: "Construction Corp",
    location: "Latakia",
    salary: "$1,800 - $2,200",
    type: "full-time",
    category: "Management",
    postedAt: "5 days ago",
    isVerified: true,
  },
  {
    id: "6",
    title: "Sales Representative",
    company: "Retail Solutions",
    location: "Damascus",
    type: "part-time",
    category: "Sales",
    postedAt: "1 day ago",
    isVerified: false,
  },
  {
    id: "7",
    title: "Content Writer",
    company: "Media House",
    location: "Remote",
    salary: "$500 - $800",
    type: "contract",
    category: "Content",
    postedAt: "6 days ago",
    isVerified: true,
  },
  {
    id: "8",
    title: "HR Coordinator",
    company: "HR Solutions Syria",
    location: "Damascus",
    salary: "$900 - $1,100",
    type: "full-time",
    category: "Human Resources",
    postedAt: "2 weeks ago",
    isVerified: true,
  },
];

const Jobs = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t('jobs.allCategories'));
  const [selectedLocation, setSelectedLocation] = useState(t('jobs.allLocations'));

  const categories = [
    t('jobs.allCategories'),
    "Technology",
    "Marketing",
    "Finance",
    "Design",
    "Management",
    "Sales",
    "Content",
    "Human Resources",
  ];

  const locations = [
    t('jobs.allLocations'),
    "Damascus",
    "Aleppo",
    "Homs",
    "Latakia",
    "Tartus",
    "Remote",
  ];

  const filteredJobs = sampleJobs.filter((job) => {
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
                {t('jobs.subtitle', { count: sampleJobs.length })}
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

            {filteredJobs.length > 0 ? (
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

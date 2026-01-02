import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TenderCard, type Tender } from "@/components/tenders/TenderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tendersAPI, type TenderRecord } from "@/lib/api";
import { 
  Search, 
  MapPin, 
  FileText,
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

// Helper function to map TenderRecord to Tender
const mapTenderRecordToTender = (tenderRecord: TenderRecord): Tender => {
  // Format deadline
  const deadline = tenderRecord.deadline 
    ? format(new Date(tenderRecord.deadline), "MMM d, yyyy")
    : "Not specified";

  // Format posted date
  const postedAt = tenderRecord.created_at 
    ? formatDistanceToNow(new Date(tenderRecord.created_at), { addSuffix: true })
    : "Recently";

  // Map status
  let status: Tender["status"] = "open";
  if (tenderRecord.status === "closed") {
    status = "closed";
  } else if (tenderRecord.status === "closing_soon" || tenderRecord.status === "closing-soon") {
    status = "closing-soon";
  } else {
    status = "open";
  }

  return {
    id: tenderRecord.id,
    title: tenderRecord.title,
    organization: (tenderRecord as any).organization?.name || "Organization", // API might include organization info
    organizationLogo: (tenderRecord as any).organization?.logo_url,
    location: tenderRecord.location || "Not specified",
    deadline,
    category: tenderRecord.category || "General",
    postedAt,
    isVerified: tenderRecord.status === "open" || tenderRecord.status === "active",
    status,
  };
};

const Tenders = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t('tenders.allCategories'));
  const [selectedLocation, setSelectedLocation] = useState(t('tenders.allLocations'));
  const [selectedStatus, setSelectedStatus] = useState(t('tenders.allStatus'));

  // Fetch tenders from API
  const { data: tendersData, isLoading, error } = useQuery({
    queryKey: ['tenders'],
    queryFn: async () => {
      const result = await tendersAPI.getAll();
      return Array.isArray(result) ? result : result.data || [];
    },
  });

  const tenders: Tender[] = useMemo(() => {
    if (!tendersData) return [];
    return tendersData.map(mapTenderRecordToTender);
  }, [tendersData]);

  // Extract unique categories and locations from tenders
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    tenders.forEach(tender => {
      if (tender.category) uniqueCategories.add(tender.category);
    });
    return [t('tenders.allCategories'), ...Array.from(uniqueCategories).sort()];
  }, [tenders, t]);

  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    tenders.forEach(tender => {
      if (tender.location) uniqueLocations.add(tender.location);
    });
    return [t('tenders.allLocations'), ...Array.from(uniqueLocations).sort()];
  }, [tenders, t]);

  const statusOptions = [
    { value: t('tenders.allStatus'), key: 'all' },
    { value: t('tenders.open'), key: 'open' },
    { value: t('tenders.closingSoon'), key: 'closing-soon' },
    { value: t('tenders.closed'), key: 'closed' },
  ];

  const getStatusKey = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option?.key || 'all';
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch = 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === t('tenders.allCategories') || tender.category === selectedCategory;
    const matchesLocation = 
      selectedLocation === t('tenders.allLocations') || tender.location === selectedLocation;
    const statusKey = getStatusKey(selectedStatus);
    const matchesStatus = 
      statusKey === 'all' || tender.status === statusKey;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(t('tenders.allCategories'));
    setSelectedLocation(t('tenders.allLocations'));
    setSelectedStatus(t('tenders.allStatus'));
  };

  const hasFilters = searchQuery || selectedCategory !== t('tenders.allCategories') || selectedLocation !== t('tenders.allLocations') || selectedStatus !== t('tenders.allStatus');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Header */}
        <section className="bg-gradient-hero py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t('tenders.title')} <span className="text-gradient-primary">{t('tenders.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('tenders.subtitle', { count: tenders.length })}
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
                  placeholder={t('tenders.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-44">
                  <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t('tenders.category')} />
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
                <SelectTrigger className="w-full lg:w-40">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t('tenders.location')} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full lg:w-36">
                  <SelectValue placeholder={t('tenders.status')} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.key} value={status.value}>
                      {status.value}
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

        {/* Tender listings */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {t('tenders.showing')} <span className="font-semibold text-foreground">{filteredTenders.length}</span> {t('tenders.tenders')}
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">{t('common.loading') || 'Loading tenders...'}</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Error loading tenders</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Failed to load tenders. Please try again later.'}
                </p>
              </div>
            ) : filteredTenders.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTenders.map((tender) => (
                  <TenderCard key={tender.id} tender={tender} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('tenders.noTendersFound')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('tenders.noTendersDescription')}
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  {t('tenders.clearAllFilters')}
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

export default Tenders;

import { useState, useMemo, useEffect } from "react";
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
const mapTenderRecordToTender = (tenderRecord: TenderRecord, isArabic: boolean): Tender => {
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

  // Display Arabic fields when in Arabic mode, English fields when in English mode
  // If Arabic field is missing, fallback to English
  const title = isArabic 
    ? (tenderRecord.title_ar || tenderRecord.title || "No title")
    : tenderRecord.title || "No title";
  const location = isArabic
    ? (tenderRecord.location_ar || tenderRecord.location || "Not specified")
    : (tenderRecord.location || "Not specified");
  const category = isArabic
    ? (tenderRecord.category_ar || tenderRecord.category || "General")
    : (tenderRecord.category || "General");

  return {
    id: tenderRecord.id,
    title,
    organization: (tenderRecord as any).organization?.name || "Organization", // API might include organization info
    organizationLogo: (tenderRecord as any).organization?.logo_url,
    location,
    deadline,
    category,
    postedAt,
    isVerified: tenderRecord.status === "open" || tenderRecord.status === "active",
    status,
    userRole: (tenderRecord as any).user_role as "user" | "company" | "organization" | "admin" | undefined,
    // Store original record for search purposes
    _originalRecord: tenderRecord,
  };
};

const Tenders = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
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

  const tenders: (Tender & { _originalRecord?: TenderRecord })[] = useMemo(() => {
    if (!tendersData) return [];
    return tendersData.map(record => mapTenderRecordToTender(record, isArabic));
  }, [tendersData, isArabic]);

  // Reset filters when language changes
  useEffect(() => {
    setSelectedCategory(t('tenders.allCategories'));
    setSelectedLocation(t('tenders.allLocations'));
    setSelectedStatus(t('tenders.allStatus'));
  }, [isArabic, t]);

  // Extract unique categories and locations from tenders (both English and Arabic)
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    tenders.forEach(tender => {
      if (tender.category) uniqueCategories.add(tender.category);
      // Also include Arabic category if available
      if (tender._originalRecord?.category_ar) uniqueCategories.add(tender._originalRecord.category_ar);
      // Also include English category for filtering
      if (tender._originalRecord?.category) uniqueCategories.add(tender._originalRecord.category);
    });
    return [t('tenders.allCategories'), ...Array.from(uniqueCategories).sort()];
  }, [tenders, t]);

  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    tenders.forEach(tender => {
      if (tender.location) uniqueLocations.add(tender.location);
      // Also include Arabic location if available
      if (tender._originalRecord?.location_ar) uniqueLocations.add(tender._originalRecord.location_ar);
      // Also include English location for filtering
      if (tender._originalRecord?.location) uniqueLocations.add(tender._originalRecord.location);
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
    const record = tender._originalRecord;
    if (!record) return false;

    // Search in both English and Arabic fields
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      (tender.title && tender.title.toLowerCase().includes(searchLower)) ||
      (record.title_ar && record.title_ar.toLowerCase().includes(searchLower)) ||
      (record.title && record.title.toLowerCase().includes(searchLower)) ||
      (tender.organization && tender.organization.toLowerCase().includes(searchLower)) ||
      (record.description && record.description.toLowerCase().includes(searchLower)) ||
      (record.description_ar && record.description_ar.toLowerCase().includes(searchLower)) ||
      (record.requirements && record.requirements.toLowerCase().includes(searchLower)) ||
      (record.requirements_ar && record.requirements_ar.toLowerCase().includes(searchLower));

    // Category matching - check both displayed category and original categories
    const allCategoriesLabel = t('tenders.allCategories');
    // If "All Categories" is selected (in current language), match all
    const matchesCategory = 
      selectedCategory === allCategoriesLabel || 
      // Check if selectedCategory matches any of the category fields
      tender.category === selectedCategory ||
      record.category === selectedCategory ||
      record.category_ar === selectedCategory;

    // Location matching - check both displayed location and original locations
    const allLocationsLabel = t('tenders.allLocations');
    // If "All Locations" is selected (in current language), match all
    const matchesLocation = 
      selectedLocation === allLocationsLabel || 
      // Check if selectedLocation matches any of the location fields
      tender.location === selectedLocation ||
      record.location === selectedLocation ||
      record.location_ar === selectedLocation;

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

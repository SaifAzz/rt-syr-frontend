import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TenderCard, type Tender } from "@/components/tenders/TenderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  FileText,
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
const sampleTenders: Tender[] = [
  {
    id: "1",
    title: "IT Infrastructure Upgrade Project",
    organization: "Ministry of Communications",
    location: "Damascus",
    deadline: "Jan 15, 2025",
    category: "Technology",
    postedAt: "1 day ago",
    isVerified: true,
    status: "open",
  },
  {
    id: "2",
    title: "Office Supplies Procurement",
    organization: "Syrian Red Crescent",
    location: "National",
    deadline: "Jan 10, 2025",
    category: "Procurement",
    postedAt: "3 days ago",
    isVerified: true,
    status: "closing-soon",
  },
  {
    id: "3",
    title: "Construction of Medical Facility",
    organization: "Health Development NGO",
    location: "Aleppo",
    deadline: "Feb 1, 2025",
    category: "Construction",
    postedAt: "5 days ago",
    isVerified: true,
    status: "open",
  },
  {
    id: "4",
    title: "Educational Program Development",
    organization: "Education Foundation",
    location: "Damascus",
    deadline: "Jan 20, 2025",
    category: "Education",
    postedAt: "1 week ago",
    isVerified: true,
    status: "open",
  },
  {
    id: "5",
    title: "Vehicle Fleet Maintenance Contract",
    organization: "Logistics Company Ltd",
    location: "Homs",
    deadline: "Dec 30, 2024",
    category: "Transportation",
    postedAt: "2 weeks ago",
    isVerified: false,
    status: "closing-soon",
  },
  {
    id: "6",
    title: "Solar Panel Installation",
    organization: "Green Energy Initiative",
    location: "Latakia",
    deadline: "Feb 15, 2025",
    category: "Energy",
    postedAt: "4 days ago",
    isVerified: true,
    status: "open",
  },
  {
    id: "7",
    title: "Security Services Contract",
    organization: "Industrial Complex",
    location: "Damascus",
    deadline: "Dec 25, 2024",
    category: "Services",
    postedAt: "1 week ago",
    isVerified: true,
    status: "closed",
  },
  {
    id: "8",
    title: "Agricultural Equipment Supply",
    organization: "Farmers Cooperative",
    location: "Hama",
    deadline: "Jan 25, 2025",
    category: "Agriculture",
    postedAt: "6 days ago",
    isVerified: true,
    status: "open",
  },
];

const Tenders = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t('tenders.allCategories'));
  const [selectedLocation, setSelectedLocation] = useState(t('tenders.allLocations'));
  const [selectedStatus, setSelectedStatus] = useState(t('tenders.allStatus'));

  const categories = [
    t('tenders.allCategories'),
    "Technology",
    "Procurement",
    "Construction",
    "Education",
    "Transportation",
    "Energy",
    "Services",
    "Agriculture",
  ];

  const locations = [
    t('tenders.allLocations'),
    "Damascus",
    "Aleppo",
    "Homs",
    "Hama",
    "Latakia",
    "National",
  ];

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

  const filteredTenders = sampleTenders.filter((tender) => {
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
                {t('tenders.subtitle', { count: sampleTenders.length })}
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

            {filteredTenders.length > 0 ? (
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

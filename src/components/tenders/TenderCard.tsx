import { Link } from "react-router-dom";
import { 
  MapPin, 
  Building2, 
  Clock, 
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Tender {
  id: string;
  title: string;
  organization: string;
  organizationLogo?: string;
  location: string;
  deadline: string;
  category: string;
  postedAt: string;
  isVerified?: boolean;
  status: "open" | "closing-soon" | "closed";
}

interface TenderCardProps {
  tender: Tender;
  className?: string;
}

const statusColors = {
  "open": "bg-success/10 text-success",
  "closing-soon": "bg-warning/10 text-warning",
  "closed": "bg-destructive/10 text-destructive",
};

const statusLabels = {
  "open": "Open",
  "closing-soon": "Closing Soon",
  "closed": "Closed",
};

export function TenderCard({ tender, className }: TenderCardProps) {
  return (
    <div className={cn(
      "group bg-card rounded-xl p-5 border border-border hover:border-accent/30 transition-all duration-300 hover-lift",
      className
    )}>
      <div className="flex items-start gap-4">
        {/* Organization logo */}
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
          {tender.organizationLogo ? (
            <img src={tender.organizationLogo} alt={tender.organization} className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                {tender.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {tender.organization}
                  {tender.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  )}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className={cn("shrink-0", statusColors[tender.status])}>
              {statusLabels[tender.status]}
            </Badge>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {tender.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Deadline: {tender.deadline}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {tender.category}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {tender.postedAt}
            </span>
            <Button variant="ghost" size="sm" className="group/btn text-accent hover:text-accent" asChild>
              <Link to={`/tenders/${tender.id}`}>
                View Details
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

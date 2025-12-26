import { Link } from "react-router-dom";
import { 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign, 
  Briefcase,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  category: string;
  postedAt: string;
  isVerified?: boolean;
}

interface JobCardProps {
  job: Job;
  className?: string;
}

const typeColors = {
  "full-time": "bg-success/10 text-success",
  "part-time": "bg-info/10 text-info",
  "contract": "bg-warning/10 text-warning",
  "remote": "bg-primary/10 text-primary",
};

export function JobCard({ job, className }: JobCardProps) {
  return (
    <div className={cn(
      "group bg-card rounded-xl p-5 border border-border hover:border-primary/30 transition-all duration-300 hover-lift",
      className
    )}>
      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {job.company}
                  {job.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  )}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className={cn("shrink-0", typeColors[job.type])}>
              {job.type.replace("-", " ")}
            </Badge>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {job.salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {job.category}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {job.postedAt}
            </span>
            <Button variant="ghost" size="sm" className="group/btn" asChild>
              <Link to={`/jobs/${job.id}`}>
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

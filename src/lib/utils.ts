import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Stats management for homepage statistics
export interface HomeStats {
  activeOpportunities: number;
  registeredUsers: number;
  verifiedCompanies: number;
  organizations: number;
}

// Full stats response from API
export interface StatsResponse {
  activeOpportunities: number;
  registeredUsers: number;
  companies: number;
  organizations: number;
  jobs: number;
  tenders: number;
  breakdown: {
    activeJobs: number;
    activeTenders: number;
    totalJobs: number;
    totalTenders: number;
    totalCompanies: number;
    totalOrganizations: number;
    verifiedCompanies: number;
  };
}

const STATS_STORAGE_KEY = 'homepage_stats';
const DEFAULT_STATS: HomeStats = {
  activeOpportunities: 0,
  registeredUsers: 0,
  verifiedCompanies: 0,
  organizations: 0,
};

export function getHomeStats(): HomeStats {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading stats from localStorage:', error);
  }
  return DEFAULT_STATS;
}

export function setHomeStats(stats: HomeStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats to localStorage:', error);
  }
}

export function formatStatValue(value: number | undefined | null): string {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  if (value === 0) {
    return '0';
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K+`;
  }
  return `${value}+`;
}

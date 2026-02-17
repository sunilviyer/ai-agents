/**
 * Home Match Agent - TypeScript Types
 * Agent slug: house-finder
 *
 * Type consistency:
 * - Python Pydantic models in agents/house-finder/utils/models.py (source of truth)
 * - TypeScript types here (must match exactly)
 * - JSONB fields in PostgreSQL (input_parameters, output_result)
 */

export interface HomeMatchInput {
  location: string;
  max_price: number;
  min_bedrooms: number;
  min_bathrooms: number;
  property_types: string[];
  must_haves: string[];
  school_priority: "low" | "medium" | "high";
  commute_addresses?: string[];
}

export interface School {
  name: string;
  rating: number; // Fraser Institute rating 0-10
  distance_km: number;
  type: string; // elementary, secondary
}

export interface SchoolAnalysis {
  nearby_schools: School[];
  average_rating: number;
  best_school: string;
}

export interface CommuteInfo {
  destination: string;
  distance_km: number;
  drive_time_minutes: number;
  transit_time_minutes?: number;
}

export interface CommuteAnalysis {
  commutes: CommuteInfo[];
  average_drive_time: number;
}

export interface PropertyMatch {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  listing_url: string;
  walk_score: number;
  school_scores: SchoolAnalysis;
  distance_to_schools: number; // Average distance to top schools
  match_score: number; // 0-100 calculated score
  pros: string[];
  cons: string[];
}

export interface HomeMatchOutput {
  executive_summary: string;
  matches: PropertyMatch[];
  school_analysis: SchoolAnalysis;
  commute_analysis?: CommuteAnalysis;
  market_insights: string;
  recommendations: string[];
}

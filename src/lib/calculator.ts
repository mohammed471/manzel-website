export type ProjectType = 'interior_design' | 'exterior_design' | 'full_execution' | 'finishing' | 'plans';
export type PropertyType = 'house_villa' | 'apartment' | 'office_commercial' | 'cafe_restaurant' | 'other';
export type QualityLevel = 'standard' | 'premium' | 'luxury';
export type AdditionalOption = '3d_design' | 'supervision' | 'full_furnishing' | 'smart_lighting' | 'sound_system';

// Base rates per m² in USD
const BASE_RATES: Record<ProjectType, Record<QualityLevel, number>> = {
  interior_design:  { standard: 15,  premium: 25,   luxury: 45 },
  exterior_design:  { standard: 12,  premium: 20,   luxury: 35 },
  full_execution:   { standard: 80,  premium: 130,  luxury: 200 },
  finishing:        { standard: 30,  premium: 50,   luxury: 85 },
  plans:            { standard: 5,   premium: 8,    luxury: 12 },
};

const PROPERTY_MULTIPLIERS: Record<PropertyType, number> = {
  house_villa: 1.0,
  apartment: 0.9,
  office_commercial: 1.1,
  cafe_restaurant: 1.15,
  other: 1.0,
};

const ADDITIONAL_FEES: Record<AdditionalOption, number> = {
  '3d_design': 500,
  supervision: 1000,
  full_furnishing: 3000,
  smart_lighting: 2000,
  sound_system: 1500,
};

export interface EstimateParams {
  projectType: ProjectType;
  propertyType: PropertyType;
  area: number;
  qualityLevel: QualityLevel;
  additionalOptions: AdditionalOption[];
}

export interface EstimateResult {
  low: number;
  mid: number;
  high: number;
}

export function calculateEstimate(params: EstimateParams): EstimateResult {
  const baseRate = BASE_RATES[params.projectType][params.qualityLevel];
  const multiplier = PROPERTY_MULTIPLIERS[params.propertyType];
  const additionalTotal = params.additionalOptions.reduce(
    (sum, opt) => sum + ADDITIONAL_FEES[opt], 0
  );
  const mid = (baseRate * params.area * multiplier) + additionalTotal;
  return { low: Math.round(mid * 0.85), mid: Math.round(mid), high: Math.round(mid * 1.15) };
}

// Also export the ADDITIONAL_FEES so the Calculator component can display prices
export { ADDITIONAL_FEES as OPTION_PRICES };

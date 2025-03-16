/**
 * Auto data type definitions for the auto service
 */

// Auto details contains various properties about a specific car
export interface AutoDetails {
  engine?: string;
  transmission?: string;
  fuelType?: string;
  drivetrain?: string;
  horsepower?: number;
  torque?: number;
  fuelEconomy?: {
    city?: number;
    highway?: number;
    combined?: number;
  };
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    wheelbase?: number;
  };
  weight?: number;
  seatingCapacity?: number;
  cargoCapacity?: number;
  // Add other potential properties based on your actual data
  [key: string]: any; // Allow for additional properties
}

// SubModel represents a specific variant of a car model
export interface SubModel {
  name: string;
  year?: number;
  trim?: string;
  autoDetails: AutoDetails;
}

// Model represents a car model with its submodels
export interface Model {
  name: string;
  description?: string;
  subModels: SubModel[];
}

// MakeData represents all data for a specific car manufacturer
export interface MakeData {
  models: Model[];
}

// SearchResult represents the structure returned by the search method
export interface SearchResult {
  make: string;
  model: string;
  subModel: string;
  details: AutoDetails;
}

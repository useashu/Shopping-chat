// Core mobile phone data structure
export interface Phone {
  id: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number; // For discount calculations
  availability: 'in-stock' | 'out-of-stock' | 'pre-order';
  imageUrl: string;
  specs: PhoneSpecs;
  features: string[];
  pros: string[];
  cons: string[];
  category: 'budget' | 'mid-range' | 'premium' | 'flagship';
  releaseDate: string;
  rating?: number;
  reviewCount?: number;
}

export interface PhoneSpecs {
  // Display
  display: {
    size: string; // "6.1 inches"
    resolution: string; // "1170x2532"
    type: string; // "Super Retina XDR OLED"
    refreshRate: string; // "60Hz" or "120Hz"
    brightness?: string; // "800 nits"
  };
  
  // Performance
  processor: {
    chipset: string; // "A16 Bionic"
    cpu: string; // "Hexa-core"
    gpu: string; // "Apple GPU"
  };
  
  // Memory & Storage
  memory: {
    ram: string; // "6GB"
    storage: string[]; // ["128GB", "256GB", "512GB"]
    expandable: boolean;
    maxExpandable?: string; // "1TB"
  };
  
  // Camera
  camera: {
    rear: {
      primary: string; // "48MP"
      ultrawide?: string; // "12MP"
      telephoto?: string; // "12MP"
      features: string[]; // ["OIS", "Night mode", "Portrait"]
    };
    front: {
      primary: string; // "12MP"
      features: string[]; // ["Portrait", "Night mode"]
    };
    video: {
      rear: string; // "4K@60fps"
      front: string; // "4K@60fps"
    };
  };
  
  // Battery & Charging
  battery: {
    capacity: string; // "3349mAh"
    fastCharging: string; // "20W"
    wirelessCharging?: string; // "15W"
    batteryLife: string; // "Up to 20 hours video"
  };
  
  // Operating System
  os: {
    name: string; // "iOS 17"
    version: string; // "17.0"
    upgradable: boolean;
  };
  
  // Build & Design
  build: {
    dimensions: string; // "147.6 x 71.6 x 7.80 mm"
    weight: string; // "171g"
    material: string; // "Aluminum frame, Glass back"
    colors: string[]; // ["Blue", "Pink", "Yellow", "Green", "Black"]
    waterResistance?: string; // "IP68"
  };
  
  // Connectivity
  connectivity: {
    network: string[]; // ["5G", "4G LTE"]
    wifi: string; // "Wi-Fi 6"
    bluetooth: string; // "5.3"
    nfc: boolean;
    usb: string; // "USB-C" or "Lightning"
  };
  
  // Additional Features
  security: string[]; // ["Face ID", "Touch ID"]
  sensors: string[]; // ["Accelerometer", "Gyroscope", "Proximity"]
}

// AI Chat related types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  phones?: Phone[]; // Attached phone recommendations
  type?: 'text' | 'phone-recommendation' | 'comparison' | 'error';
}

export interface UserQuery {
  message: string;
  intent: QueryIntent;
  filters: QueryFilters;
}

export interface QueryIntent {
  type: 'search' | 'compare' | 'explain' | 'details' | 'unknown';
  confidence: number;
  entities: ExtractedEntities;
}

export interface ExtractedEntities {
  budget?: {
    min?: number;
    max?: number;
    currency: string;
  };
  brands?: string[];
  features?: string[];
  category?: string;
  specificModels?: string[];
}

export interface QueryFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  brands?: string[];
  features?: string[];
  category?: 'budget' | 'mid-range' | 'premium' | 'flagship';
  availability?: 'in-stock' | 'out-of-stock' | 'pre-order';
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest' | 'relevance';
}

// AI Response types
export interface AIResponse {
  type: 'success' | 'error' | 'security_refusal' | 'scope_refusal';
  message: string;
  phones?: Phone[];
  intent?: QueryIntent;
  suggestions?: string[];
  reasoning?: string;
}

// Security and validation types
export interface SecurityCheck {
  isAdversarial: boolean;
  isIrrelevant: boolean;
  isSafe: boolean;
  reason?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedInput?: string;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Search and filter types
export interface SearchResult {
  phones: Phone[];
  total: number;
  filters: AppliedFilters;
  searchQuery: string;
  suggestions: string[];
}

export interface AppliedFilters {
  priceRange?: { min: number; max: number };
  brands: string[];
  features: string[];
  category?: string;
}

// Comparison types
export interface PhoneComparison {
  phones: Phone[];
  comparisonMatrix: ComparisonCategory[];
  winner?: {
    overall: number; // Phone ID
    categories: { [key: string]: number }; // Category -> Phone ID
  };
  summary: string;
}

export interface ComparisonCategory {
  name: string;
  weight: number;
  scores: { phoneId: number; score: number; reasoning: string }[];
}

// UI Component types
export interface ProductCardProps {
  phone: Phone;
  variant?: 'default' | 'compact' | 'comparison';
  onSelect?: (phone: Phone) => void;
  isSelected?: boolean;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export interface MessageProps {
  message: ChatMessage;
  isLatest?: boolean;
}

// Utility types
export type Brand = 'Apple' | 'Samsung' | 'OnePlus' | 'Google' | 'Xiaomi' | 'Realme' | 'Vivo' | 'Oppo' | 'Nothing' | 'Motorola';

export type PriceRange = 'under-15k' | '15k-30k' | '30k-50k' | 'above-50k';

export type FeatureCategory = 'camera' | 'battery' | 'performance' | 'display' | 'design' | 'value';

// Configuration types
export interface AppConfig {
  ai: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  security: {
    maxMessageLength: number;
    rateLimitPerMinute: number;
    enableAdversarialDetection: boolean;
  };
  ui: {
    maxPhonesPerResponse: number;
    enableAnimations: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}
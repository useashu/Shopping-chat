import { Phone, QueryFilters, SearchResult } from '@/types';
import phonesData from '@/data/phones.json';

/**
 * Database utility functions for phone operations
 * Provides filtering, searching, and data retrieval functionality
 */

// Get all phones
export function getAllPhones(): Phone[] {
  return phonesData.phones as Phone[];
}

// Get phone by ID
export function getPhoneById(id: number): Phone | null {
  const phones = getAllPhones();
  return phones.find(phone => phone.id === id) || null;
}

// Get phones by brand
export function getPhonesByBrand(brand: string): Phone[] {
  const phones = getAllPhones();
  return phones.filter(phone => 
    phone.brand.toLowerCase() === brand.toLowerCase()
  );
}

// Get phones by category
export function getPhonesByCategory(category: string): Phone[] {
  const phones = getAllPhones();
  return phones.filter(phone => phone.category === category);
}

// Get phones by price range
export function getPhonesByPriceRange(min: number, max: number): Phone[] {
  const phones = getAllPhones();
  return phones.filter(phone => phone.price >= min && phone.price <= max);
}

// Advanced search with filters
export function searchPhones(filters: QueryFilters): SearchResult {
  let phones = getAllPhones();
  
  // Apply price range filter
  if (filters.priceRange) {
    phones = phones.filter(phone => 
      phone.price >= filters.priceRange!.min && 
      phone.price <= filters.priceRange!.max
    );
  }
  
  // Apply brand filter
  if (filters.brands && filters.brands.length > 0) {
    phones = phones.filter(phone => 
      filters.brands!.some(brand => 
        phone.brand.toLowerCase() === brand.toLowerCase()
      )
    );
  }
  
  // Apply category filter
  if (filters.category) {
    phones = phones.filter(phone => phone.category === filters.category);
  }
  
  // Apply availability filter
  if (filters.availability) {
    phones = phones.filter(phone => phone.availability === filters.availability);
  }
  
  // Apply feature filters (check if phone has required features)
  if (filters.features && filters.features.length > 0) {
    phones = phones.filter(phone => {
      const phoneFeatures = phone.features.map(f => f.toLowerCase());
      return filters.features!.some(feature => 
        phoneFeatures.some(phoneFeature => 
          phoneFeature.includes(feature.toLowerCase()) ||
          feature.toLowerCase().includes(phoneFeature)
        )
      );
    });
  }
  
  // Sort phones based on sortBy parameter
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        phones.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        phones.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        phones.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        phones.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'relevance':
      default:
        // Keep original order for relevance
        break;
    }
  }
  
  return {
    phones,
    total: phones.length,
    filters: {
      priceRange: filters.priceRange,
      brands: filters.brands || [],
      features: filters.features || [],
      category: filters.category
    },
    searchQuery: '',
    suggestions: generateSearchSuggestions(phones)
  };
}

// Generate search suggestions based on available phones
function generateSearchSuggestions(phones: Phone[]): string[] {
  const suggestions: string[] = [];
  
  // Brand suggestions
  const brands = Array.from(new Set(phones.map(phone => phone.brand)));
  brands.forEach(brand => {
    suggestions.push(`${brand} phones`);
    suggestions.push(`Best ${brand} phone`);
  });
  
  // Category suggestions
  const categories = Array.from(new Set(phones.map(phone => phone.category)));
  categories.forEach(category => {
    suggestions.push(`${category} phones`);
    suggestions.push(`Best ${category} phone`);
  });
  
  // Feature-based suggestions
  suggestions.push(
    'Best camera phone',
    'Long battery life',
    'Fast charging phone',
    'Gaming phone',
    '5G phones',
    'Wireless charging',
    'Water resistant phones'
  );
  
  return suggestions.slice(0, 6); // Return top 6 suggestions
}

// Search phones by text query (name, brand, model)
export function searchPhonesByText(query: string): Phone[] {
  const phones = getAllPhones();
  const searchTerm = query.toLowerCase();
  
  return phones.filter(phone => 
    phone.name.toLowerCase().includes(searchTerm) ||
    phone.brand.toLowerCase().includes(searchTerm) ||
    phone.model.toLowerCase().includes(searchTerm) ||
    phone.features.some(feature => feature.toLowerCase().includes(searchTerm))
  );
}

// Get phones for comparison (limit to 3)
export function getPhonesForComparison(phoneIds: number[]): Phone[] {
  const phones = getAllPhones();
  return phoneIds
    .map(id => phones.find(phone => phone.id === id))
    .filter((phone): phone is Phone => phone !== undefined)
    .slice(0, 3); // Limit to 3 phones for comparison
}

// Get similar phones based on category and price range
export function getSimilarPhones(phone: Phone, limit: number = 5): Phone[] {
  const phones = getAllPhones();
  const priceRange = phone.price * 0.3; // 30% price range
  
  return phones
    .filter(p => 
      p.id !== phone.id && // Exclude the phone itself
      p.category === phone.category && // Same category
      Math.abs(p.price - phone.price) <= priceRange // Similar price
    )
    .sort((a, b) => Math.abs(a.price - phone.price) - Math.abs(b.price - phone.price))
    .slice(0, limit);
}

// Get phones by specific criteria for AI queries
export function getPhonesByCriteria(criteria: {
  budget?: { min?: number; max?: number };
  brands?: string[];
  features?: string[];
  category?: string;
  display?: { minSize?: number; refreshRate?: string };
  camera?: { minMegapixel?: number; features?: string[] };
  battery?: { minCapacity?: number; fastCharging?: boolean };
  performance?: { gaming?: boolean; flagship?: boolean };
}): Phone[] {
  let phones = getAllPhones();
  
  // Budget filter
  if (criteria.budget) {
    const min = criteria.budget.min || 0;
    const max = criteria.budget.max || Infinity;
    phones = phones.filter(phone => phone.price >= min && phone.price <= max);
  }
  
  // Brand filter
  if (criteria.brands && criteria.brands.length > 0) {
    phones = phones.filter(phone => 
      criteria.brands!.some(brand => 
        phone.brand.toLowerCase() === brand.toLowerCase()
      )
    );
  }
  
  // Feature filter
  if (criteria.features && criteria.features.length > 0) {
    phones = phones.filter(phone => {
      const phoneFeatures = phone.features.map(f => f.toLowerCase());
      return criteria.features!.some(feature => 
        phoneFeatures.some(phoneFeature => 
          phoneFeature.includes(feature.toLowerCase())
        )
      );
    });
  }
  
  // Category filter
  if (criteria.category) {
    phones = phones.filter(phone => phone.category === criteria.category);
  }
  
  // Display criteria
  if (criteria.display) {
    if (criteria.display.minSize) {
      phones = phones.filter(phone => {
        const size = parseFloat(phone.specs.display.size);
        return size >= criteria.display!.minSize!;
      });
    }
    
    if (criteria.display.refreshRate) {
      phones = phones.filter(phone => 
        phone.specs.display.refreshRate.includes(criteria.display!.refreshRate!)
      );
    }
  }
  
  // Camera criteria
  if (criteria.camera) {
    if (criteria.camera.minMegapixel) {
      phones = phones.filter(phone => {
        const megapixel = parseInt(phone.specs.camera.rear.primary);
        return megapixel >= criteria.camera!.minMegapixel!;
      });
    }
    
    if (criteria.camera.features && criteria.camera.features.length > 0) {
      phones = phones.filter(phone => {
        const cameraFeatures = phone.specs.camera.rear.features.map(f => f.toLowerCase());
        return criteria.camera!.features!.some(feature => 
          cameraFeatures.some(cameraFeature => 
            cameraFeature.includes(feature.toLowerCase())
          )
        );
      });
    }
  }
  
  // Battery criteria
  if (criteria.battery) {
    if (criteria.battery.minCapacity) {
      phones = phones.filter(phone => {
        const capacity = parseInt(phone.specs.battery.capacity);
        return capacity >= criteria.battery!.minCapacity!;
      });
    }
    
    if (criteria.battery.fastCharging) {
      phones = phones.filter(phone => {
        const chargingWatts = parseInt(phone.specs.battery.fastCharging);
        return chargingWatts >= 25; // Consider 25W+ as fast charging
      });
    }
  }
  
  // Performance criteria
  if (criteria.performance) {
    if (criteria.performance.gaming) {
      phones = phones.filter(phone => {
        // Gaming phones typically have high refresh rate and good processor
        const refreshRate = parseInt(phone.specs.display.refreshRate);
        const isGamingChipset = [
          'snapdragon 8 gen', 'a17 pro', 'a16 bionic', 'dimensity 9000'
        ].some(chip => phone.specs.processor.chipset.toLowerCase().includes(chip));
        
        return refreshRate >= 90 && isGamingChipset;
      });
    }
    
    if (criteria.performance.flagship) {
      phones = phones.filter(phone => phone.category === 'flagship' || phone.category === 'premium');
    }
  }
  
  return phones;
}

// Get brand statistics
export function getBrandStats() {
  const phones = getAllPhones();
  const brandStats: { [key: string]: { count: number; avgPrice: number; categories: string[] } } = {};
  
  phones.forEach(phone => {
    if (!brandStats[phone.brand]) {
      brandStats[phone.brand] = {
        count: 0,
        avgPrice: 0,
        categories: []
      };
    }
    
    brandStats[phone.brand].count++;
    brandStats[phone.brand].avgPrice += phone.price;
    
    if (brandStats[phone.brand].categories.indexOf(phone.category) === -1) {
      brandStats[phone.brand].categories.push(phone.category);
    }
  });
  
  // Calculate average prices
  Object.keys(brandStats).forEach(brand => {
    brandStats[brand].avgPrice = Math.round(brandStats[brand].avgPrice / brandStats[brand].count);
  });
  
  return brandStats;
}

// Get category statistics
export function getCategoryStats() {
  const phones = getAllPhones();
  const categoryStats: { [key: string]: { count: number; priceRange: { min: number; max: number } } } = {};
  
  phones.forEach(phone => {
    if (!categoryStats[phone.category]) {
      categoryStats[phone.category] = {
        count: 0,
        priceRange: { min: Infinity, max: 0 }
      };
    }
    
    categoryStats[phone.category].count++;
    categoryStats[phone.category].priceRange.min = Math.min(categoryStats[phone.category].priceRange.min, phone.price);
    categoryStats[phone.category].priceRange.max = Math.max(categoryStats[phone.category].priceRange.max, phone.price);
  });
  
  return categoryStats;
}
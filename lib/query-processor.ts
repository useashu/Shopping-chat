import { UserQuery, QueryIntent, ExtractedEntities, QueryFilters } from '@/types';

/**
 * AI Query Processing utilities
 * Handles natural language understanding and intent extraction from user queries
 */

/**
 * Processes user query to extract intent and entities
 */
export function processUserQuery(message: string): UserQuery {
  const intent = extractIntent(message);
  const entities = extractEntities(message);
  const filters = convertEntitiesToFilters(entities);
  
  return {
    message,
    intent,
    filters
  };
}

/**
 * Extracts user intent from the message
 */
function extractIntent(message: string): QueryIntent {
  const lowerMessage = message.toLowerCase();
  
  // Comparison intent patterns
  const comparisonPatterns = [
    /compare\s+(.+?)\s+(?:vs|versus|and)\s+(.+)/i,
    /(.+?)\s+(?:vs|versus|or)\s+(.+?)(?:\s+comparison)?/i,
    /difference\s+between\s+(.+?)\s+and\s+(.+)/i,
    /which\s+is\s+better\s+(.+?)\s+(?:or|vs)\s+(.+)/i,
  ];
  
  for (const pattern of comparisonPatterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        type: 'compare',
        confidence: 0.9,
        entities: extractEntities(message)
      };
    }
  }
  
  // Explanation intent patterns
  const explanationPatterns = [
    /what\s+is\s+(\w+)/i,
    /explain\s+(\w+)/i,
    /difference\s+between\s+(\w+)\s+and\s+(\w+)/i,
    /tell\s+me\s+about\s+(\w+)/i,
    /(?:what|how)\s+(?:is|does)\s+(\w+)/i,
  ];
  
  for (const pattern of explanationPatterns) {
    if (pattern.test(message)) {
      return {
        type: 'explain',
        confidence: 0.85,
        entities: extractEntities(message)
      };
    }
  }
  
  // Details intent patterns
  const detailPatterns = [
    /tell\s+me\s+more\s+about/i,
    /details?\s+(?:of|about|for)/i,
    /specs?\s+(?:of|for)/i,
    /specifications?\s+(?:of|for)/i,
    /more\s+info/i,
  ];
  
  for (const pattern of detailPatterns) {
    if (pattern.test(message)) {
      return {
        type: 'details',
        confidence: 0.8,
        entities: extractEntities(message)
      };
    }
  }
  
  // Search intent (default for most queries)
  const searchIndicators = [
    /(?:best|top|good|recommend)/i,
    /(?:under|below|within|around)\s*₹/i,
    /(?:phone|mobile|smartphone)/i,
    /(?:camera|battery|performance|gaming)/i,
    /(?:brand|samsung|apple|xiaomi|oneplus)/i,
  ];
  
  const hasSearchIndicators = searchIndicators.some(pattern => pattern.test(message));
  
  if (hasSearchIndicators || message.length > 10) {
    return {
      type: 'search',
      confidence: 0.7,
      entities: extractEntities(message)
    };
  }
  
  return {
    type: 'unknown',
    confidence: 0.3,
    entities: extractEntities(message)
  };
}

/**
 * Extracts entities from user message
 */
function extractEntities(message: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  
  // Extract budget/price range
  entities.budget = extractBudget(message);
  
  // Extract brands
  entities.brands = extractBrands(message);
  
  // Extract features
  entities.features = extractFeatures(message);
  
  // Extract category (budget-aware)
  entities.category = extractCategory(message, entities.budget);
  
  // Extract specific models
  entities.specificModels = extractModels(message);
  
  return entities;
}

/**
 * Extracts budget information from message
 */
function extractBudget(message: string): { min?: number; max?: number; currency: string } | undefined {
  // Indian Rupee patterns
  const rupeePatterns = [
    /under\s*₹\s*(\d+(?:,\d+)*(?:k|000)?)/gi,
    /below\s*₹\s*(\d+(?:,\d+)*(?:k|000)?)/gi,
    /within\s*₹\s*(\d+(?:,\d+)*(?:k|000)?)/gi,
    /around\s*₹\s*(\d+(?:,\d+)*(?:k|000)?)/gi,
    /₹\s*(\d+(?:,\d+)*(?:k|000)?)\s*(?:to|-)?\s*₹?\s*(\d+(?:,\d+)*(?:k|000)?)?/gi,
    /budget\s*(?:of|is)?\s*₹\s*(\d+(?:,\d+)*(?:k|000)?)/gi,
  ];
  
  for (const pattern of rupeePatterns) {
    const match = pattern.exec(message);
    if (match) {
      const firstAmount = parseIndianCurrency(match[1]);
      const secondAmount = match[2] ? parseIndianCurrency(match[2]) : undefined;
      
      if (message.match(/under|below|within/i)) {
        return { max: firstAmount, currency: 'INR' };
      } else if (message.match(/around|about/i)) {
        return { 
          min: Math.round(firstAmount * 0.8), 
          max: Math.round(firstAmount * 1.2), 
          currency: 'INR' 
        };
      } else if (secondAmount) {
        return { 
          min: Math.min(firstAmount, secondAmount), 
          max: Math.max(firstAmount, secondAmount), 
          currency: 'INR' 
        };
      } else {
        return { max: firstAmount, currency: 'INR' };
      }
    }
  }
  
  return undefined;
}

/**
 * Parses Indian currency format (handles 'k' suffix and commas)
 */
function parseIndianCurrency(amount: string): number {
  let cleaned = amount.replace(/,/g, '');
  
  if (cleaned.endsWith('k') || cleaned.endsWith('K')) {
    return parseInt(cleaned.slice(0, -1)) * 1000;
  }
  
  if (cleaned.endsWith('000')) {
    return parseInt(cleaned);
  }
  
  const num = parseInt(cleaned);
  
  // If it's a small number, assume it's in thousands
  if (num < 100) {
    return num * 1000;
  }
  
  return num;
}

/**
 * Extracts brand names from message
 */
function extractBrands(message: string): string[] {
  const brands = ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Realme', 'Vivo', 'Oppo', 'Nothing', 'Motorola', 'Poco'];
  const foundBrands: string[] = [];
  
  const lowerMessage = message.toLowerCase();
  
  brands.forEach(brand => {
    if (lowerMessage.includes(brand.toLowerCase())) {
      foundBrands.push(brand);
    }
  });
  
  // Special cases for brand aliases
  if (lowerMessage.includes('pixel')) {
    foundBrands.push('Google');
  }
  if (lowerMessage.includes('iphone')) {
    foundBrands.push('Apple');
  }
  if (lowerMessage.includes('galaxy')) {
    foundBrands.push('Samsung');
  }
  if (lowerMessage.includes('redmi') || lowerMessage.includes('mi ')) {
    foundBrands.push('Xiaomi');
  }
  
  return Array.from(new Set(foundBrands)); // Remove duplicates
}

/**
 * Extracts feature preferences from message
 */
function extractFeatures(message: string): string[] {
  const featureMap: { [key: string]: string[] } = {
    'camera': ['camera', 'photo', 'photography', 'selfie', 'portrait', 'night mode', 'zoom'],
    'battery': ['battery', 'backup', 'power', 'charging', 'mah'],
    'performance': ['performance', 'speed', 'fast', 'gaming', 'processor', 'ram'],
    'display': ['display', 'screen', 'amoled', 'oled', 'refresh rate', 'hz'],
    'design': ['design', 'premium', 'build', 'glass', 'metal', 'lightweight'],
    'storage': ['storage', 'memory', 'gb', 'expandable'],
    '5g': ['5g', 'network', 'connectivity'],
    'water resistant': ['water', 'resistant', 'waterproof', 'ip68', 'ip67'],
    'wireless charging': ['wireless', 'charging'],
    'face id': ['face', 'unlock', 'biometric'],
    'fingerprint': ['fingerprint', 'touch'],
    'compact': ['compact', 'small', 'one hand', 'pocket'],
    'large screen': ['large', 'big', 'screen'],
    'fast charging': ['fast', 'quick', 'rapid', 'charging'],
  };
  
  const foundFeatures: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  for (const feature in featureMap) {
    const keywords = featureMap[feature];
    if (keywords.some((keyword: string) => lowerMessage.includes(keyword))) {
      foundFeatures.push(feature);
    }
  }
  
  return foundFeatures;
}

/**
 * Extracts category preference from message (budget-aware)
 */
function extractCategory(message: string, budget?: { min?: number; max?: number }): string | undefined {
  const lowerMessage = message.toLowerCase();
  
  // If budget is specified, use budget-based categorization first
  if (budget?.max) {
    if (budget.max <= 20000) {
      return 'budget';
    }
    if (budget.max <= 40000) {
      return 'mid-range';
    }
    if (budget.max <= 80000) {
      return 'premium';
    }
    return 'flagship';
  }
  
  // Fallback to keyword-based detection
  if (lowerMessage.match(/budget|cheap|affordable|under.*15|under.*20/)) {
    return 'budget';
  }
  
  if (lowerMessage.match(/mid.*range|middle|moderate|around.*30|under.*40/)) {
    return 'mid-range';
  }
  
  if (lowerMessage.match(/premium|high.*end|expensive|above.*50|above.*60/)) {
    return 'premium';
  }
  
  if (lowerMessage.match(/flagship|ultra|pro.*max|above.*80|above.*100/)) {
    return 'flagship';
  }
  
  // Don't auto-assign flagship for "best" without high budget
  if (lowerMessage.match(/best.*phone/) && !budget?.max) {
    return undefined; // Let budget determine category
  }
  
  return undefined;
}

/**
 * Extracts specific phone models from message
 */
function extractModels(message: string): string[] {
  const modelPatterns = [
    /iPhone\s+(\d+(?:\s+Pro(?:\s+Max)?)?)/gi,
    /Galaxy\s+(S\d+(?:\s+Ultra)?)/gi,
    /OnePlus\s+(\d+R?)/gi,
    /Pixel\s+(\d+a?)/gi,
    /Redmi\s+(Note\s+\d+(?:\s+Pro\+?)?|\d+C?)/gi,
    /Realme\s+(\d+(?:\s+Pro\+?)?|GT\s+\d+|C\d+)/gi,
    /Nothing\s+Phone\s+\((\d+a?)\)/gi,
    /Poco\s+(X\d+(?:\s+Pro)?|F\d+)/gi,
  ];
  
  const foundModels: string[] = [];
  
  modelPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      foundModels.push(match[0]);
    }
  });
  
  return foundModels;
}

/**
 * Converts extracted entities to database query filters
 */
function convertEntitiesToFilters(entities: ExtractedEntities): QueryFilters {
  const filters: QueryFilters = {};
  
  // Budget to price range
  if (entities.budget) {
    filters.priceRange = {
      min: entities.budget.min || 0,
      max: entities.budget.max || Infinity
    };
  }
  
  // Brands
  if (entities.brands && entities.brands.length > 0) {
    filters.brands = entities.brands;
  }
  
  // Features
  if (entities.features && entities.features.length > 0) {
    filters.features = entities.features;
  }
  
  // Category
  if (entities.category) {
    filters.category = entities.category as 'budget' | 'mid-range' | 'premium' | 'flagship';
  }
  
  return filters;
}

/**
 * Generates search suggestions based on query
 */
export function generateQuerySuggestions(query: string): string[] {
  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Brand-based suggestions
  const brands = ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi'];
  brands.forEach(brand => {
    if (lowerQuery.includes(brand.toLowerCase())) {
      suggestions.push(`Best ${brand} phone under ₹30k`);
      suggestions.push(`${brand} phones with good camera`);
    }
  });
  
  // Feature-based suggestions
  if (lowerQuery.includes('camera')) {
    suggestions.push('Best camera phone under ₹30k');
    suggestions.push('Phone with excellent night mode');
  }
  
  if (lowerQuery.includes('battery')) {
    suggestions.push('Phone with longest battery life');
    suggestions.push('Fast charging phones under ₹25k');
  }
  
  if (lowerQuery.includes('gaming')) {
    suggestions.push('Best gaming phone under ₹40k');
    suggestions.push('High refresh rate phones');
  }
  
  // Budget-based suggestions
  if (lowerQuery.includes('budget') || lowerQuery.includes('cheap')) {
    suggestions.push('Best phone under ₹15k');
    suggestions.push('Budget phones with good camera');
  }
  
  // Generic suggestions if no specific match
  if (suggestions.length === 0) {
    suggestions.push(
      'Best phone under ₹30k',
      'Camera phones under ₹25k',
      'Gaming phones with 120Hz',
      'Long battery life phones',
      'Compact Android phones'
    );
  }
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
}
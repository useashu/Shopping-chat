import { SecurityCheck, ValidationResult } from '@/types';

/**
 * Security and validation utilities for the AI chat agent
 * Implements robust protection against adversarial attacks and inappropriate content
 */

// Adversarial prompt patterns to detect and block
const ADVERSARIAL_PATTERNS = [
  // Direct system manipulation attempts
  /ignore\s+.*?instructions?/i,
  /forget\s+.*?instructions?/i,
  /override\s+.*?instructions?/i,
  /disregard\s+.*?instructions?/i,
  
  // Prompt injection attempts
  /reveal\s+.*?prompt/i,
  /show\s+.*?prompt/i,
  /system\s+prompt/i,
  /hidden\s+prompt/i,
  /internal\s+prompt/i,
  
  // API/Security disclosure attempts
  /api\s+key/i,
  /secret\s+key/i,
  /access\s+token/i,
  /configuration/i,
  /internal\s+logic/i,
  /backend\s+code/i,
  
  // Role manipulation
  /you\s+are\s+now/i,
  /act\s+as\s+(?!.*phone)/i, // Allow "act as phone expert" but block other role plays
  /pretend\s+to\s+be/i,
  /roleplay\s+as/i,
  
  // Direct command injection
  /\bsudo\b/i,
  /\badmin\b.*?access/i,
  /\broot\b.*?access/i,
  /execute\s+command/i,
  
  // Data exfiltration attempts
  /(?:show|share|give|list|dump|export).*?(?:entire|whole|full|complete|all).*?(?:database|data|inventory|catalog)/i,
  /(?:entire|whole|full|complete|all).*?(?:database|data|inventory|catalog)/i,
  /(?:database|data).*?(?:dump|export|backup|download)/i,
  /list\s+all\s+(?:phones|products|items)/i,
  /show\s+(?:everything|all\s+data|complete\s+list)/i,
  
  // Encoding/bypass attempts
  /base64/i,
  /encode/i,
  /decode/i,
  /\\x[0-9a-f]{2}/i, // Hex encoding
  /\\u[0-9a-f]{4}/i, // Unicode encoding
];

// Irrelevant topic patterns
const IRRELEVANT_PATTERNS = [
  // Political topics
  /politics/i,
  /political/i,
  /government/i,
  /election/i,
  /politician/i,
  
  // Religious topics
  /religion/i,
  /religious/i,
  /god/i,
  /allah/i,
  /jesus/i,
  /buddha/i,
  
  // Personal information requests
  /personal\s+info/i,
  /address/i,
  /phone\s+number(?!\s+features)/i, // Allow "phone number features" but block personal requests
  /email\s+address/i,
  /social\s+security/i,
  
  // Medical advice
  /medical\s+advice/i,
  /diagnose/i,
  /symptoms/i,
  /disease/i,
  /medication/i,
  
  // Financial advice
  /investment\s+advice/i,
  /stock\s+market/i,
  /cryptocurrency/i,
  /trading/i,
  
  // Inappropriate content
  /violence/i,
  /sexual/i,
  /adult\s+content/i,
  /illegal/i,
  /drugs/i,
  
  // Non-mobile technology
  /laptop/i,
  /computer/i,
  /desktop/i,
  /tablet(?!\s+mode)/i, // Allow "tablet mode" but block tablet devices
  /car/i,
  /automobile/i,
];

// Toxic language patterns
const TOXIC_PATTERNS = [
  // Hate speech
  /hate/i,
  /racism/i,
  /sexism/i,
  
  // Profanity (basic detection)
  /f\*+k/i,
  /sh\*+t/i,
  /damn/i,
  
  // Harassment
  /stupid/i,
  /idiot/i,
  /moron/i,
  
  // Threats
  /kill/i,
  /murder/i,
  /threat/i,
];

// Brand defamation patterns
const DEFAMATION_PATTERNS = [
  /trash\s+(?:apple|samsung|google|xiaomi|oneplus|realme|vivo|oppo|nothing|motorola)/i,
  /garbage\s+(?:apple|samsung|google|xiaomi|oneplus|realme|vivo|oppo|nothing|motorola)/i,
  /terrible\s+(?:apple|samsung|google|xiaomi|oneplus|realme|vivo|oppo|nothing|motorola)/i,
  /worst\s+(?:apple|samsung|google|xiaomi|oneplus|realme|vivo|oppo|nothing|motorola)/i,
  /hate\s+(?:apple|samsung|google|xiaomi|oneplus|realme|vivo|oppo|nothing|motorola)/i,
];

/**
 * Validates user input for security threats
 * @param input - User input to validate
 * @returns SecurityCheck object with validation results
 */
export function validateUserInput(input: string): SecurityCheck {
  if (!input || typeof input !== 'string') {
    return {
      isSafe: false,
      isAdversarial: false,
      isIrrelevant: true,
      reason: 'Invalid input format'
    };
  }

  const cleanInput = input.toLowerCase().trim();

  // Check for adversarial patterns
  for (const pattern of ADVERSARIAL_PATTERNS) {
    if (pattern.test(cleanInput)) {
      return {
        isSafe: false,
        isAdversarial: true,
        isIrrelevant: false,
        reason: 'Adversarial prompt detected - attempting to manipulate AI behavior'
      };
    }
  }

  // Check for irrelevant queries
  for (const pattern of IRRELEVANT_PATTERNS) {
    if (pattern.test(cleanInput)) {
      return {
        isSafe: false,
        isAdversarial: false,
        isIrrelevant: true,
        reason: 'Query is not related to mobile phones or shopping'
      };
    }
  }

  // Check for toxic content
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(cleanInput)) {
      return {
        isSafe: false,
        isAdversarial: false,
        isIrrelevant: false,
        reason: 'Inappropriate language or toxic content detected'
      };
    }
  }

  // If all checks pass, the input is safe
  return {
    isSafe: true,
    isAdversarial: false,
    isIrrelevant: false,
    reason: 'Input passed all security checks'
  };
}

/**
 * Generates appropriate security response based on validation results
 * @param securityCheck - Security validation results
 * @returns Appropriate response message
 */
export function getSecurityResponse(securityCheck: SecurityCheck): string {
  if (securityCheck.isAdversarial) {
    return "I'm a shopping assistant for mobile phones. I can't help with requests that try to change my behavior or access system information. Please ask about phone features, comparisons, or recommendations.";
  }
  
  if (securityCheck.isIrrelevant) {
    return "I'm specifically designed to help with mobile phone shopping. I can help you find phones, compare features, check prices, and make recommendations. What phone-related question can I help you with?";
  }
  
  if (!securityCheck.isSafe) {
    return "I can't process that request. Please keep our conversation focused on mobile phones and shopping assistance.";
  }
  
  return "Query is safe to process.";
}

/**
 * Sanitizes user input to remove potentially harmful content
 */
export function sanitizeInput(input: string): ValidationResult {
  let sanitized = input.trim();
  const errors: string[] = [];
  
  // Remove potential HTML/script tags
  if (/<[^>]*>/g.test(sanitized)) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    errors.push('HTML tags were removed from input');
  }
  
  // Remove potential SQL injection patterns
  const sqlPatterns = [
    /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bSELECT\b).*?(FROM|INTO|SET)\b/gi,
    /(\bUNION\b|\bJOIN\b).*?\bSELECT\b/gi,
    /--[\s\S]*$/gm, // SQL comments
    /\/\*[\s\S]*?\*\//g // Multi-line comments
  ];
  
  sqlPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, '');
      errors.push('Potential SQL injection patterns were removed');
    }
  });
  
  // Check length constraints
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
    errors.push('Input was truncated to 500 characters');
  }
  
  if (sanitized.length === 0) {
    return {
      isValid: false,
      errors: ['Input is empty after sanitization'],
    };
  }
  
  return {
    isValid: true,
    errors,
    sanitizedInput: sanitized
  };
}

/**
 * Validates AI response to ensure it doesn't contain hallucinated information
 */
export function validateAIResponse(
  response: string, 
  phoneData: any[], 
  userQuery: string
): boolean {
  // Check if response contains any phone specifications
  const specPatterns = [
    /(\d+)\s*mp/gi, // Megapixel mentions
    /(\d+)\s*mah/gi, // Battery capacity
    /(\d+)\s*gb/gi, // Storage/RAM
    /(\d+)\s*hz/gi, // Refresh rate
    /(\d+)\s*inch/gi, // Display size
    /₹\s*(\d+)/gi, // Price mentions
  ];
  
  let hasSpecs = false;
  specPatterns.forEach(pattern => {
    if (pattern.test(response)) {
      hasSpecs = true;
    }
  });
  
  // If response contains specs, verify they exist in our database
  if (hasSpecs && phoneData.length > 0) {
    // Extract mentioned phone names from response
    const mentionedPhones = extractPhoneNamesFromText(response);
    
    // Check if all mentioned phones exist in our database (flexible matching)
    const validPhones = phoneData.map(phone => phone.name.toLowerCase());
    const invalidMentions = mentionedPhones.filter(phone => {
      const cleanPhone = phone.toLowerCase().trim();
      // Check if any valid phone name contains the mentioned phone (partial matching)
      return !validPhones.some(validPhone => 
        validPhone.includes(cleanPhone) || cleanPhone.includes(validPhone)
      );
    });
    
    if (invalidMentions.length > 0) {
      console.warn('AI response contains unverified phone mentions:', invalidMentions);
      // Only return false if there are significant unverified mentions
      // Allow minor variations and partial matches
      const significantInvalidMentions = invalidMentions.filter(phone => 
        phone.trim().length > 3 && !phone.match(/^(Pro|Max|Ultra|Plus)$/i)
      );
      
      if (significantInvalidMentions.length > 0) {
        return false;
      }
    }
  }
  
  // Check for potential hallucination indicators
  const hallucinationPatterns = [
    /according to my training data/i,
    /i believe/i,
    /i think/i,
    /it seems/i,
    /probably/i,
    /might be/i,
    /could be/i,
  ];
  
  const hasHallucinationIndicators = hallucinationPatterns.some(pattern => 
    pattern.test(response)
  );
  
  if (hasHallucinationIndicators) {
    console.warn('AI response contains uncertainty indicators');
    return false;
  }
  
  return true;
}

/**
 * Extracts phone names mentioned in text
 */
function extractPhoneNamesFromText(text: string): string[] {
  const phonePatterns = [
    /iPhone\s+\d+(?:\s+Pro(?:\s+Max)?)?/gi,
    /Galaxy\s+[A-Z]\d+(?:\s+Ultra)?/gi,
    /OnePlus\s+\d+[RT]?(?:\s+Pro)?/gi,
    /Pixel\s+\d+(?:\s+Pro(?:\s+XL)?)?/gi,
    /Redmi\s+(?:Note\s+)?\d+(?:\s+Pro)?/gi,
    /Realme\s+\d+(?:\s+Pro)?/gi,
    /Nothing\s+Phone\s*\([^)]+\)/gi,
    /Poco\s+[A-Z]\d+(?:\s+Pro)?/gi,
  ];
  
  const phones: string[] = [];
  phonePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      // Clean up the matches and remove extra whitespace
      const cleanMatches = matches.map(match => match.trim().replace(/\s+/g, ' '));
      phones.push(...cleanMatches);
    }
  });
  
  return Array.from(new Set(phones)); // Remove duplicates
}

/**
 * Rate limiting functionality
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(clientId: string, maxRequests: number = 10, windowMinutes: number = 1): boolean {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const clientData = rateLimitStore.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (clientData.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  // Increment count
  clientData.count++;
  rateLimitStore.set(clientId, clientData);
  return true;
}

/**
 * Generate security response messages
 */
// Duplicate function removed - using the earlier implementation

/**
 * Clean and prepare text for AI processing
 */
export function prepareTextForAI(text: string): string {
  // Remove extra whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Remove special characters that might interfere
  cleaned = cleaned.replace(/[^\w\s\-.,!?₹()]/g, '');
  
  // Ensure reasonable length
  if (cleaned.length > 300) {
    cleaned = cleaned.substring(0, 300) + '...';
  }
  
  return cleaned;
}
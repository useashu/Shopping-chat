import { NextRequest, NextResponse } from 'next/server';
import { getPhonesForComparison } from '@/lib/database';
import { PhoneComparison, Phone } from '@/types';

/**
 * POST /api/compare
 * Compare multiple phones and provide detailed analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneIds } = body;

    // Validate input
    if (!phoneIds || !Array.isArray(phoneIds) || phoneIds.length < 2 || phoneIds.length > 3) {
      return NextResponse.json(
        { error: 'Please provide 2-3 phone IDs for comparison' },
        { status: 400 }
      );
    }

    // Get phones for comparison
    const phones = getPhonesForComparison(phoneIds);
    
    if (phones.length < 2) {
      return NextResponse.json(
        { error: 'Could not find enough phones for comparison' },
        { status: 404 }
      );
    }

    // Generate comparison
    const comparison = generatePhoneComparison(phones);
    
    return NextResponse.json(comparison);

  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generates detailed phone comparison
 */
function generatePhoneComparison(phones: Phone[]): PhoneComparison {
  const comparisonMatrix = [
    {
      name: 'Price & Value',
      weight: 0.25,
      scores: phones.map(phone => ({
        phoneId: phone.id,
        score: calculatePriceScore(phone, phones),
        reasoning: `₹${phone.price.toLocaleString('en-IN')} - ${getPriceCategory(phone.price)}`
      }))
    },
    {
      name: 'Camera Quality',
      weight: 0.2,
      scores: phones.map(phone => ({
        phoneId: phone.id,
        score: calculateCameraScore(phone),
        reasoning: `${phone.specs.camera.rear.primary} main camera with ${phone.specs.camera.rear.features.join(', ')}`
      }))
    },
    {
      name: 'Performance',
      weight: 0.2,
      scores: phones.map(phone => ({
        phoneId: phone.id,
        score: calculatePerformanceScore(phone),
        reasoning: `${phone.specs.processor.chipset} with ${phone.specs.memory.ram} RAM`
      }))
    },
    {
      name: 'Battery Life',
      weight: 0.15,
      scores: phones.map(phone => ({
        phoneId: phone.id,
        score: calculateBatteryScore(phone),
        reasoning: `${phone.specs.battery.capacity} with ${phone.specs.battery.fastCharging} charging`
      }))
    },
    {
      name: 'Display Quality',
      weight: 0.15,
      scores: phones.map(phone => ({
        phoneId: phone.id,
        score: calculateDisplayScore(phone),
        reasoning: `${phone.specs.display.size} ${phone.specs.display.type} (${phone.specs.display.refreshRate})`
      }))
    },
    {
      name: 'Build & Design',
      weight: 0.05,
      scores: phones.map(phone => ({
        phoneId: phone.id,
        score: calculateBuildScore(phone),
        reasoning: `${phone.specs.build.material}, ${phone.specs.build.weight}`
      }))
    }
  ];

  // Calculate overall winner
  const overallScores = phones.map(phone => {
    const totalScore = comparisonMatrix.reduce((sum, category) => {
      const phoneScore = category.scores.find(s => s.phoneId === phone.id)?.score || 0;
      return sum + (phoneScore * category.weight);
    }, 0);
    return { phoneId: phone.id, score: totalScore };
  });

  const winner = overallScores.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  );

  // Generate category winners
  const categoryWinners: { [key: string]: number } = {};
  comparisonMatrix.forEach(category => {
    const categoryWinner = category.scores.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    );
    categoryWinners[category.name] = categoryWinner.phoneId;
  });

  return {
    phones,
    comparisonMatrix,
    winner: {
      overall: winner.phoneId,
      categories: categoryWinners
    },
    summary: generateComparisonSummary(phones, winner.phoneId, categoryWinners)
  };
}

/**
 * Scoring functions for different aspects
 */
function calculatePriceScore(phone: Phone, allPhones: Phone[]): number {
  const prices = allPhones.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Lower price = higher score (inverted scale)
  const normalizedPrice = (maxPrice - phone.price) / (maxPrice - minPrice);
  return Math.round(normalizedPrice * 100);
}

function calculateCameraScore(phone: Phone): number {
  let score = 0;
  
  // Main camera megapixels
  const megapixels = parseInt(phone.specs.camera.rear.primary);
  score += Math.min(megapixels / 2, 50); // Max 50 points for camera MP
  
  // Camera features
  const features = phone.specs.camera.rear.features;
  if (features.indexOf('OIS') !== -1) score += 15;
  if (features.indexOf('Night mode') !== -1) score += 10;
  if (features.indexOf('Portrait') !== -1) score += 5;
  if (features.indexOf('Pro mode') !== -1) score += 5;
  if (phone.specs.camera.rear.telephoto) score += 15;
  
  return Math.min(score, 100);
}

function calculatePerformanceScore(phone: Phone): number {
  let score = 0;
  
  // Processor score (simplified)
  const processor = phone.specs.processor.chipset.toLowerCase();
  if (processor.includes('a17 pro')) score += 50;
  else if (processor.includes('a16')) score += 45;
  else if (processor.includes('snapdragon 8 gen 3')) score += 48;
  else if (processor.includes('snapdragon 8 gen 2')) score += 40;
  else if (processor.includes('tensor g3')) score += 35;
  else if (processor.includes('dimensity')) score += 30;
  else score += 20;
  
  // RAM score
  const ram = parseInt(phone.specs.memory.ram);
  score += Math.min(ram * 3, 30); // Max 30 points for RAM
  
  // Refresh rate bonus
  const refreshRate = parseInt(phone.specs.display.refreshRate);
  if (refreshRate >= 120) score += 20;
  else if (refreshRate >= 90) score += 10;
  
  return Math.min(score, 100);
}

function calculateBatteryScore(phone: Phone): number {
  let score = 0;
  
  // Battery capacity
  const capacity = parseInt(phone.specs.battery.capacity);
  score += Math.min(capacity / 50, 60); // Max 60 points for capacity
  
  // Fast charging
  const chargingWatts = parseInt(phone.specs.battery.fastCharging);
  score += Math.min(chargingWatts / 3, 30); // Max 30 points for charging speed
  
  // Wireless charging bonus
  if (phone.specs.battery.wirelessCharging) score += 10;
  
  return Math.min(score, 100);
}

function calculateDisplayScore(phone: Phone): number {
  let score = 0;
  
  // Display type
  const displayType = phone.specs.display.type.toLowerCase();
  if (displayType.includes('amoled') || displayType.includes('oled')) score += 40;
  else if (displayType.includes('ips')) score += 25;
  else score += 15;
  
  // Refresh rate
  const refreshRate = parseInt(phone.specs.display.refreshRate);
  if (refreshRate >= 120) score += 30;
  else if (refreshRate >= 90) score += 20;
  else score += 10;
  
  // Brightness
  const brightness = parseInt(phone.specs.display.brightness || '0');
  score += Math.min(brightness / 40, 30); // Max 30 points for brightness
  
  return Math.min(score, 100);
}

function calculateBuildScore(phone: Phone): number {
  let score = 40; // Base score
  
  // Material quality
  const material = phone.specs.build.material.toLowerCase();
  if (material.includes('titanium')) score += 30;
  else if (material.includes('aluminum') && material.includes('glass')) score += 25;
  else if (material.includes('aluminum')) score += 20;
  else if (material.includes('glass')) score += 15;
  else score += 10;
  
  // Water resistance
  if (phone.specs.build.waterResistance) {
    const rating = phone.specs.build.waterResistance.toLowerCase();
    if (rating.includes('ip68')) score += 20;
    else if (rating.includes('ip67')) score += 15;
    else if (rating.includes('ip65') || rating.includes('ip54')) score += 10;
  }
  
  // Weight consideration (lighter is generally better for comfort)
  const weight = parseInt(phone.specs.build.weight);
  if (weight < 180) score += 10;
  else if (weight > 220) score -= 5;
  
  return Math.min(score, 100);
}

function getPriceCategory(price: number): string {
  if (price < 15000) return 'Budget';
  if (price < 30000) return 'Mid-range';
  if (price < 50000) return 'Premium';
  return 'Flagship';
}

function generateComparisonSummary(phones: Phone[], winnerId: number, categoryWinners: { [key: string]: number }): string {
  const winner = phones.find(p => p.id === winnerId);
  if (!winner) return '';
  
  const winnerName = winner.name;
  const winnerCategories: string[] = [];
  for (const category in categoryWinners) {
    if (categoryWinners[category] === winnerId) {
      winnerCategories.push(category);
    }
  }
  
  let summary = `Overall, the ${winnerName} offers the best combination of features and value.`;
  
  if (winnerCategories.length > 0) {
    summary += ` It excels in ${winnerCategories.join(', ')}.`;
  }
  
  // Add specific recommendations for different use cases
  const cameraWinner = phones.find(p => p.id === categoryWinners['Camera Quality']);
  const performanceWinner = phones.find(p => p.id === categoryWinners['Performance']);
  const batteryWinner = phones.find(p => p.id === categoryWinners['Battery Life']);
  
  const recommendations: string[] = [];
  if (cameraWinner && cameraWinner.id !== winnerId) {
    recommendations.push(`For photography: ${cameraWinner.name}`);
  }
  if (performanceWinner && performanceWinner.id !== winnerId) {
    recommendations.push(`For gaming/performance: ${performanceWinner.name}`);
  }
  if (batteryWinner && batteryWinner.id !== winnerId) {
    recommendations.push(`For battery life: ${batteryWinner.name}`);
  }
  
  if (recommendations.length > 0) {
    summary += ` However, consider: ${recommendations.join(', ')}.`;
  }
  
  return summary;
}
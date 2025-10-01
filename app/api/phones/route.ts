import { NextRequest, NextResponse } from 'next/server';
import { searchPhones, getAllPhones, getPhoneById, getPhonesByBrand, getPhonesByCategory } from '@/lib/database';
import { QueryFilters } from '@/types';

/**
 * GET /api/phones
 * Retrieve phones with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get individual phone by ID
    const id = searchParams.get('id');
    if (id) {
      const phone = getPhoneById(parseInt(id));
      if (!phone) {
        return NextResponse.json(
          { error: 'Phone not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ phone });
    }
    
    // Get phones by brand
    const brand = searchParams.get('brand');
    if (brand) {
      const phones = getPhonesByBrand(brand);
      return NextResponse.json({ phones, total: phones.length });
    }
    
    // Get phones by category
    const category = searchParams.get('category');
    if (category) {
      const phones = getPhonesByCategory(category);
      return NextResponse.json({ phones, total: phones.length });
    }
    
    // Build filters from query parameters
    const filters: QueryFilters = {};
    
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: minPrice ? parseInt(minPrice) : 0,
        max: maxPrice ? parseInt(maxPrice) : Infinity
      };
    }
    
    const brands = searchParams.get('brands');
    if (brands) {
      filters.brands = brands.split(',').map(b => b.trim());
    }
    
    const features = searchParams.get('features');
    if (features) {
      filters.features = features.split(',').map(f => f.trim());
    }
    
    const sortBy = searchParams.get('sortBy');
    if (sortBy) {
      filters.sortBy = sortBy as QueryFilters['sortBy'];
    }
    
    // Search phones
    if (Object.keys(filters).length > 0) {
      const result = searchPhones(filters);
      return NextResponse.json(result);
    }
    
    // Return all phones if no filters
    const allPhones = getAllPhones();
    return NextResponse.json({ 
      phones: allPhones, 
      total: allPhones.length,
      filters: {},
      searchQuery: '',
      suggestions: []
    });
    
  } catch (error) {
    console.error('Phones API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
'use client';

import { Phone } from '@/types';

interface PhoneCardProps {
  phone: Phone;
  variant?: 'default' | 'compact' | 'comparison';
  onSelect?: (phone: Phone) => void;
  isSelected?: boolean;
}

export default function PhoneCard({ 
  phone, 
  variant = 'default', 
  onSelect, 
  isSelected = false 
}: PhoneCardProps) {
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(phone);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl border-2 p-4 transition-all duration-200 product-card-hover ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{phone.name}</h3>
          <p className="text-sm text-gray-500">{phone.brand}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">₹{phone.price.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 capitalize">{phone.category}</div>
        </div>
      </div>
      
      {/* Key Specs */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="w-16 text-gray-500">Display:</span>
          <span className="text-gray-900">{phone.specs.display.size} {phone.specs.display.type}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="w-16 text-gray-500">Camera:</span>
          <span className="text-gray-900">{phone.specs.camera.rear.primary} main</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="w-16 text-gray-500">Battery:</span>
          <span className="text-gray-900">{phone.specs.battery.capacity}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="w-16 text-gray-500">RAM:</span>
          <span className="text-gray-900">{phone.specs.memory.ram}</span>
        </div>
      </div>
      
      {/* Features */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {phone.features.slice(0, 4).map((feature, index) => (
            <span 
              key={index}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
          {phone.features.length > 4 && (
            <span className="text-xs text-gray-400">+{phone.features.length - 4} more</span>
          )}
        </div>
      </div>
      
      {/* Rating */}
      {phone.rating && (
        <div className="flex items-center text-sm text-gray-600">
          <span className="text-yellow-400 mr-1">⭐</span>
          <span>{phone.rating}</span>
          {phone.reviewCount && (
            <span className="text-gray-400 ml-1">({phone.reviewCount} reviews)</span>
          )}
        </div>
      )}
      
      {/* Availability */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            phone.availability === 'in-stock' 
              ? 'bg-green-100 text-green-700' 
              : phone.availability === 'out-of-stock'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {phone.availability === 'in-stock' ? '✅ In Stock' : 
             phone.availability === 'out-of-stock' ? '❌ Out of Stock' : '🔔 Pre-order'}
          </span>
          
          {onSelect && (
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              {isSelected ? 'Selected' : 'Select'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
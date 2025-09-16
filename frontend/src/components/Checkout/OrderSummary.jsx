import React from "react";
import { Camera, Clock, Truck, Lock, Package, Check } from "lucide-react";

const OrderSummary = ({ 
  rentalItems, 
  formData, 
  subtotal, 
  deliveryFee, 
  insuranceFee, 
  tax, 
  total, 
  rentalDays,
  formatCurrency 
}) => {
  // Helper function to get the correct image URL (same as CartItem)
  const getImageUrl = (item) => {
    if (!item) return '';
    
    const possibleImageFields = [
      'imageUrl', 'image', 'images', 'photoURL', 'picture', 'thumbnail', 'img'
    ];
    
    for (const field of possibleImageFields) {
      if (item[field]) {
        if (Array.isArray(item[field]) && item[field].length > 0) {
          return item[field][0];
        }
        if (typeof item[field] === 'string' && item[field].trim()) {
          return item[field];
        }
      }
    }
    
    return '';
  };

  // Helper function to get the correct price (dailyRate for rental)
  const getDailyRate = (item) => {
    // Check for dailyRate first (rental specific)
    if (item.dailyRate) return parseFloat(item.dailyRate);
    
    // Fallback to variant price or regular price
    if (item.variant?.price) return parseFloat(item.variant.price);
    if (item.price) return parseFloat(item.price);
    
    return 0;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 sticky top-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <Camera className="text-white" size={16} />
        </div>
        <h2 className="text-xl font-bold text-white">Rental Summary</h2>
      </div>

      {/* Equipment List */}
      <div className="space-y-4 mb-6">
        {rentalItems.map((item) => {
          const imageUrl = getImageUrl(item);
          const dailyRate = getDailyRate(item);
          const quantity = item.quantity || 1;
          
          return (
            <div
              key={item.id || item.productId}
              className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700"
            >
              {/* Product Image */}
              <div className="w-16 h-16 rounded-lg border border-gray-600 overflow-hidden bg-gray-100 flex-shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name || 'Product image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="w-full h-full hidden items-center justify-center bg-gray-700">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm truncate">
                  {item.name || 'Unnamed Product'}
                </h4>
                
                {/* Category/Brand info */}
                <div className="flex items-center gap-2 mt-1">
                  {item.category && (
                    <p className="text-xs text-gray-400">{item.category}</p>
                  )}
                  {item.brand && item.category && (
                    <span className="text-gray-500">•</span>
                  )}
                  {item.brand && (
                    <p className="text-xs text-gray-400">{item.brand}</p>
                  )}
                </div>

                {/* Variant info if exists */}
                {item.variant && (
                  <p className="text-xs text-gray-500">
                    {item.variant.name || 'Variant'}
                  </p>
                )}
                
                {/* Daily Rate */}
                <p className="text-xs text-purple-400 mt-1">
                  {formatCurrency(dailyRate)}/day
                </p>
                
                {/* Quantity indicator */}
                {quantity > 1 && (
                  <p className="text-xs text-yellow-400">
                    Qty: {quantity}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show message if no items */}
      {rentalItems.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No items selected for rental</p>
        </div>
      )}

      {/* Duration Display */}
      {rentalDays > 0 && rentalItems.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="text-purple-400" size={16} />
              <span className="text-white text-sm font-medium">
                Duration
              </span>
            </div>
            <span className="text-purple-300 font-bold">
              {rentalDays} {rentalDays === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      )}

      {/* Free Delivery Indicator */}
      {formData.deliveryMethod === "delivery" && subtotal >= 5000 && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <Truck className="text-green-400" size={16} />
            <span className="text-green-300 text-sm font-medium">
              🎉 FREE DELIVERY UNLOCKED!
            </span>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-gray-700 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Equipment Subtotal</span>
          <span className="text-white font-medium">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {formData.deliveryMethod === "delivery" && deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Delivery Fee (10%)</span>
            <span className="text-white font-medium">
              {formatCurrency(deliveryFee)}
            </span>
          </div>
        )}

        {formData.deliveryMethod === "delivery" && deliveryFee === 0 && subtotal >= 5000 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Delivery Fee</span>
            <span className="text-green-400 font-medium">FREE</span>
          </div>
        )}

        {formData.insurance && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Equipment Insurance (15%)</span>
            <span className="text-white font-medium">
              {formatCurrency(insuranceFee)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">VAT (12%)</span>
          <span className="text-white font-medium">
            {formatCurrency(tax)}
          </span>
        </div>

        <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
          <span className="text-white">Total</span>
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Security Badges */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Lock size={12} />
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <Package size={12} />
            <span>Insured</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check size={12} />
            <span>Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">Questions? Call us at</p>
        <p className="text-sm text-purple-400 font-medium">
          +63 917 123 RENT
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
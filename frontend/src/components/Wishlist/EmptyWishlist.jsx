import React, { useState, useEffect } from "react";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Star,
  Filter,
  Search,
  Grid,
  List,
  Package,
  SortAsc,
} from "lucide-react";

// EmptyWishlist Component
const EmptyWishlist = () => {
  return (
    <div className="text-center py-16">
      <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
        <Heart className="w-16 h-16 text-purple-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">
        Your wishlist is empty
      </h3>
      <p className="text-white mb-8 max-w-md mx-auto">
        Start adding items you love to your wishlist and keep track of your
        favorite products!
      </p>
    </div>
  );
};

export default EmptyWishlist;

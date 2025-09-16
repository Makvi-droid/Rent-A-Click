// MyRentals.jsx - Main Component
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  onSnapshot 
} from 'firebase/firestore';

// Component imports
import MyRentalsHeader from '../components/MyRentals/MyRentalsHeader';
import MyRentalsBackground from '../components/MyRentals/MyRentalsBackground';
import MyRentalsLoadingState from '../components/MyRentals/MyRentalsLoadingState';
import MyRentalsEmptyState from '../components/MyRentals/MyRentalsEmptyState';
import MyRentalsFilters from '../components/MyRentals/MyRentalsFilters';
import MyRentalsStats from '../components/MyRentals/MyRentalsStats';
import MyRentalsList from '../components/MyRentals/MyRentalsList';
import MyRentalsAuthRequired from '../components/MyRentals/MyRentalsAuthRequired';
import Navbar from '../components/Navbar';

const MyRentals = () => {
  const [user, authLoading] = useAuthState(auth);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch user's rentals from Firestore
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchRentals = async () => {
      try {
        setLoading(true);
        
        // Query rentals for the current user
        const rentalsQuery = query(
          collection(db, 'checkouts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(rentalsQuery, (querySnapshot) => {
          const userRentals = [];
          
          querySnapshot.forEach((doc) => {
            const rentalData = doc.data();
            userRentals.push({
              id: doc.id,
              ...rentalData,
              // Convert Firestore timestamps to JavaScript dates
              createdAt: rentalData.createdAt?.toDate() || new Date(),
              updatedAt: rentalData.updatedAt?.toDate() || new Date(),
              startDate: rentalData.rentalDetails?.startDate || null,
              endDate: rentalData.rentalDetails?.endDate || null,
            });
          });

          setRentals(userRentals);
          setLoading(false);
          setError(null);
        }, (err) => {
          console.error('Error fetching rentals:', err);
          setError('Failed to load your rentals. Please try again.');
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (err) {
        console.error('Error setting up rentals listener:', err);
        setError('Failed to load your rentals. Please try again.');
        setLoading(false);
      }
    };

    fetchRentals();
  }, [user, authLoading]);

  // Filter and sort rentals
  const getFilteredAndSortedRentals = () => {
    let filteredRentals = [...rentals];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredRentals = filteredRentals.filter(rental => 
        rental.id.toLowerCase().includes(query) ||
        rental.customerInfo?.fullName?.toLowerCase().includes(query) ||
        rental.items?.some(item => 
          item.name?.toLowerCase().includes(query)
        )
      );
    }

    // Apply status filter
    if (activeFilter !== 'all') {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      filteredRentals = filteredRentals.filter(rental => {
        const startDate = rental.startDate ? new Date(rental.startDate) : null;
        const endDate = rental.endDate ? new Date(rental.endDate) : null;
        
        switch (activeFilter) {
          case 'active':
            return startDate && endDate && 
                   currentDate >= startDate && currentDate <= endDate;
          case 'upcoming':
            return startDate && currentDate < startDate;
          case 'completed':
            return endDate && currentDate > endDate;
          case 'pending':
            return rental.status === 'pending';
          case 'confirmed':
            return rental.status === 'confirmed';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredRentals.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'start-date':
          const aStart = a.startDate ? new Date(a.startDate) : new Date(0);
          const bStart = b.startDate ? new Date(b.startDate) : new Date(0);
          return bStart - aStart;
        case 'amount-high':
          return (b.pricing?.total || 0) - (a.pricing?.total || 0);
        case 'amount-low':
          return (a.pricing?.total || 0) - (b.pricing?.total || 0);
        default:
          return 0;
      }
    });

    return filteredRentals;
  };

  const filteredRentals = getFilteredAndSortedRentals();

  // Calculate stats
  const stats = {
    total: rentals.length,
    active: rentals.filter(rental => {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const startDate = rental.startDate ? new Date(rental.startDate) : null;
      const endDate = rental.endDate ? new Date(rental.endDate) : null;
      return startDate && endDate && currentDate >= startDate && currentDate <= endDate;
    }).length,
    upcoming: rentals.filter(rental => {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const startDate = rental.startDate ? new Date(rental.startDate) : null;
      return startDate && currentDate < startDate;
    }).length,
    completed: rentals.filter(rental => {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const endDate = rental.endDate ? new Date(rental.endDate) : null;
      return endDate && currentDate > endDate;
    }).length,
    totalSpent: rentals.reduce((sum, rental) => sum + (rental.pricing?.total || 0), 0)
  };

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Show loading state while fetching user data
  if (authLoading) {
    return <MyRentalsLoadingState />;
  }

  // Show auth required if user is not authenticated
  if (!user) {
    return <MyRentalsAuthRequired />;
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <Navbar/>
      <MyRentalsBackground />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <MyRentalsHeader 
          isVisible={isVisible}
          user={user}
          stats={stats}
          formatCurrency={formatCurrency}
        />

        {/* Stats Overview */}
        <MyRentalsStats 
          stats={stats}
          formatCurrency={formatCurrency}
          isVisible={isVisible}
        />

        {/* Show loading state */}
        {loading && <MyRentalsLoadingState />}

        {/* Show error state */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-red-400 text-lg font-semibold mb-2">Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Show empty state if no rentals */}
        {!loading && !error && rentals.length === 0 && (
          <MyRentalsEmptyState />
        )}

        {/* Show rentals if available */}
        {!loading && !error && rentals.length > 0 && (
          <>
            {/* Filters and Search */}
            <MyRentalsFilters
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalResults={filteredRentals.length}
              isVisible={isVisible}
            />

            {/* Rentals List */}
            <MyRentalsList
              rentals={filteredRentals}
              formatCurrency={formatCurrency}
              isVisible={isVisible}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MyRentals;
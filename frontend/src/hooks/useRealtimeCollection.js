import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';

// Custom hook for real-time collection data
export const useRealtimeCollection = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    try {
      const collectionRef = collection(db, collectionName);
      const q = queryConstraints.length > 0 
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;

      unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to Date objects
            ...(doc.data().createdAt && { createdAt: doc.data().createdAt.toDate() }),
            ...(doc.data().updatedAt && { updatedAt: doc.data().updatedAt.toDate() })
          }));
          setData(documents);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(`Error setting up listener for ${collectionName}:`, err);
      setError(err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName]);

  return { data, loading, error };
};

// Custom hook for real-time document data
export const useRealtimeDocument = (collectionName, documentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, collectionName, documentId),
      (doc) => {
        if (doc.exists()) {
          const docData = doc.data();
          setData({
            id: doc.id,
            ...docData,
            // Convert Firestore timestamps to Date objects
            ...(docData.createdAt && { createdAt: docData.createdAt.toDate() }),
            ...(docData.updatedAt && { updatedAt: docData.updatedAt.toDate() })
          });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching document ${documentId} from ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading, error };
};

// Custom hook for admin status check
export const useAdminStatus = (userId) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const adminDoc = await getDoc(doc(db, 'admin', userId));
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [userId]);

  return { isAdmin, loading };
};

// Custom hook for real-time stats
export const useRealtimeStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCheckouts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    outOfStockProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = [];

    // Users stats
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Products stats
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data());
      const outOfStock = products.filter(p => p.stock === 0 || p.status === 'out_of_stock').length;
      
      setStats(prev => ({ 
        ...prev, 
        totalProducts: snapshot.size,
        outOfStockProducts: outOfStock
      }));
    });

    // Checkouts stats
    const checkoutsUnsubscribe = onSnapshot(collection(db, 'checkouts'), (snapshot) => {
      let totalRevenue = 0;
      let pendingCount = 0;
      let completedCount = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'completed') {
          totalRevenue += parseFloat(data.amount) || 0;
          completedCount++;
        } else if (data.status === 'pending') {
          pendingCount++;
        }
      });

      setStats(prev => ({
        ...prev,
        totalCheckouts: snapshot.size,
        totalRevenue,
        pendingOrders: pendingCount,
        completedOrders: completedCount
      }));
    });

    unsubscribes.push(usersUnsubscribe, productsUnsubscribe, checkoutsUnsubscribe);
    setLoading(false);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return { stats, loading };
};

// Custom hook for recent activity
export const useRecentActivity = (limit = 10) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = [];

    // Recent checkouts
    const checkoutsQuery = query(
      collection(db, 'checkouts'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const checkoutsUnsubscribe = onSnapshot(checkoutsQuery, (snapshot) => {
      const checkoutActivities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: `checkout-${doc.id}`,
          type: 'checkout',
          title: 'New Order',
          description: `Order ${doc.id} by ${data.userEmail || 'Unknown'}`,
          amount: data.amount,
          status: data.status,
          timestamp: data.createdAt?.toDate() || new Date(),
          metadata: { orderId: doc.id, userEmail: data.userEmail }
        };
      });

      setActivities(prev => {
        const filtered = prev.filter(a => a.type !== 'checkout');
        return [...checkoutActivities, ...filtered]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
      });
    });

    // Listen for new users
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const userActivity = {
            id: `user-${change.doc.id}`,
            type: 'user',
            title: 'New User',
            description: `${data.name || data.email || 'Unknown'} registered`,
            timestamp: data.createdAt?.toDate() || new Date(),
            metadata: { userId: change.doc.id, email: data.email }
          };

          setActivities(prev => [userActivity, ...prev]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit)
          );
        }
      });
    });

    unsubscribes.push(checkoutsUnsubscribe, usersUnsubscribe);
    setLoading(false);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [limit]);

  return { activities, loading };
};
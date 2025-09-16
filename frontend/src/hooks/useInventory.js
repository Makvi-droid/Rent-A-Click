// hooks/useInventory.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export const useInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate incremental ID
  const generateInventoryId = async () => {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(inventoryRef, orderBy('id', 'desc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return 'RACIN0001';
      }
      
      const lastDoc = snapshot.docs[0];
      const lastId = lastDoc.data().id;
      
      // Extract numeric part and increment
      const match = lastId.match(/RACIN(\d+)/);
      if (match) {
        const numericPart = parseInt(match[1]) + 1;
        return `RACIN${numericPart.toString().padStart(4, '0')}`;
      } else {
        // Fallback if format doesn't match
        return 'RACIN0001';
      }
    } catch (err) {
      console.error('Error generating ID:', err);
      // Fallback ID generation
      const timestamp = Date.now().toString().slice(-4);
      return `RACIN${timestamp}`;
    }
  };

  // Listen to real-time updates
  useEffect(() => {
    const inventoryRef = collection(db, 'inventory');
    const q = query(inventoryRef, orderBy('id'));

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        try {
          const inventoryData = [];
          snapshot.forEach((doc) => {
            inventoryData.push({
              firestoreId: doc.id,
              ...doc.data()
            });
          });
          setProducts(inventoryData);
          setError(null); // Clear any previous errors
        } catch (err) {
          console.error('Error processing snapshot:', err);
          setError('Error loading products: ' + err.message);
        } finally {
          setLoading(false);
        }
      }, 
      (err) => {
        console.error('Firestore listener error:', err);
        setError('Connection error: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Add new product (without name and price)
  const addProduct = async (productData) => {
    try {
      setError(null); // Clear previous errors
      
      // Validate required fields (no longer checking name or price)
      if (!productData.category) {
        throw new Error('Product category is required');
      }
      if (productData.stock === undefined || productData.stock === null) {
        throw new Error('Stock quantity is required');
      }

      const inventoryId = await generateInventoryId();
      
      // Create new product with custom document ID (no name or price)
      const newProduct = {
        id: inventoryId,
        stock: parseInt(productData.stock) || 0,
        category: productData.category,
        image: productData.image || '📦',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Adding product to Firestore:', newProduct);
      
      // Use setDoc with custom document ID instead of addDoc
      const docRef = doc(collection(db, 'inventory'), inventoryId);
      await setDoc(docRef, newProduct);
      console.log('Product added successfully with custom ID:', inventoryId);
      
      return { success: true, id: inventoryId };
    } catch (err) {
      console.error('Error adding product:', err);
      const errorMessage = err.message || 'Failed to add product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update product (no longer handles name or price)
  const updateProduct = async (firestoreId, updates) => {
    try {
      setError(null);
      
      if (!firestoreId) {
        throw new Error('Product ID is required for update');
      }

      const productRef = doc(db, 'inventory', firestoreId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Clean up the update data (no name or price handling)
      if (updateData.stock !== undefined) {
        updateData.stock = parseInt(updateData.stock) || 0;
      }

      console.log('Updating product:', firestoreId, updateData);
      
      await updateDoc(productRef, updateData);
      console.log('Product updated successfully');
      
      return { success: true };
    } catch (err) {
      console.error('Error updating product:', err);
      const errorMessage = err.message || 'Failed to update product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete product
  const deleteProduct = async (firestoreId) => {
    try {
      setError(null);
      
      if (!firestoreId) {
        throw new Error('Product ID is required for deletion');
      }

      console.log('Deleting product:', firestoreId);
      
      await deleteDoc(doc(db, 'inventory', firestoreId));
      console.log('Product deleted successfully');
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMessage = err.message || 'Failed to delete product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update stock
  const updateStock = async (firestoreId, increment) => {
    try {
      setError(null);
      
      const product = products.find(p => p.firestoreId === firestoreId);
      if (!product) {
        throw new Error('Product not found');
      }

      const newStock = Math.max(0, product.stock + increment);
      console.log(`Updating stock for ${product.id}: ${product.stock} -> ${newStock}`);
      
      const result = await updateProduct(firestoreId, { stock: newStock });
      return result;
    } catch (err) {
      console.error('Error updating stock:', err);
      const errorMessage = err.message || 'Failed to update stock';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock
  };
};
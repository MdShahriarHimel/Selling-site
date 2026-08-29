import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import fallbackConfig from '../firebase-applet-config.json';
import { Product, OrderReceipt, PromoCode } from '../types';
import { PRODUCTS, PROMO_CODES } from '../data/products';

// Priority: Environment variables (e.g. from .env / Vercel) with fallback to firebase-applet-config.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || fallbackConfig.firestoreDatabaseId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore using the configured database ID if present
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

export const PRODUCTS_COLLECTION = 'products';
export const ORDERS_COLLECTION = 'orders';
export const PROMOS_COLLECTION = 'promos';
export const SETTINGS_COLLECTION = 'settings';

/**
 * Initialize / Seed Firestore with default catalog if empty
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log('DigiVault DB is empty. Seeding initial 24+ products to Firestore...');
      const batch = writeBatch(db);
      
      // Seed products
      PRODUCTS.forEach((prod) => {
        const prodDoc = doc(db, PRODUCTS_COLLECTION, String(prod.id));
        batch.set(prodDoc, prod);
      });

      // Seed promos
      Object.values(PROMO_CODES).forEach((promo) => {
        const promoDoc = doc(db, PROMOS_COLLECTION, promo.code.toUpperCase());
        batch.set(promoDoc, promo);
      });

      // Seed metadata settings
      const settingsDoc = doc(db, SETTINGS_COLLECTION, 'store_config');
      batch.set(settingsDoc, {
        storeName: 'DigiVault',
        discordUrl: 'https://discord.gg/lumina-vault',
        telegramSupport: '@DigiVaultSupport',
        announcement: '🔥 FLASH SALE: Use coupon DIGI20 for 20% off all developer & design subscriptions!',
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
      console.log('Seeding completed successfully!');
    }
  } catch (error) {
    console.warn('Could not auto-seed Firestore (using local fallback if offline):', error);
  }
}

/**
 * Real-time listener for all Products
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    productsRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        list.push({
          ...data,
          id: Number(data.id || docSnap.id),
        });
      });
      // Sort by ID or rating
      list.sort((a, b) => a.id - b.id);
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore products subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add or Update a Product
 */
export async function saveProductToDb(product: Product): Promise<void> {
  const prodDoc = doc(db, PRODUCTS_COLLECTION, String(product.id));
  await setDoc(prodDoc, {
    ...product,
    id: Number(product.id),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Delete a Product by ID
 */
export async function deleteProductFromDb(productId: number | string): Promise<void> {
  const prodDoc = doc(db, PRODUCTS_COLLECTION, String(productId));
  await deleteDoc(prodDoc);
}

/**
 * Save an Order to Firestore
 */
export async function saveOrderToDb(order: OrderReceipt): Promise<void> {
  try {
    const orderDoc = doc(db, ORDERS_COLLECTION, order.orderId);
    await setDoc(orderDoc, {
      ...order,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to write order to Firestore:', err);
  }
}

/**
 * Real-time listener for Orders (for Admin Panel)
 */
export function subscribeToOrders(
  onUpdate: (orders: OrderReceipt[]) => void,
  onError?: (error: Error) => void
) {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(
    ordersRef,
    (snapshot) => {
      const ordersList: OrderReceipt[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push(docSnap.data() as OrderReceipt);
      });
      // Sort newest first
      ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(ordersList);
    },
    (err) => {
      console.error('Orders subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Fetch a specific Order by ID or Email
 */
export async function lookupOrderFromDb(queryTerm: string): Promise<OrderReceipt[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const snap = await getDocs(ordersRef);
    const matches: OrderReceipt[] = [];
    const term = queryTerm.trim().toLowerCase();

    snap.forEach((d) => {
      const order = d.data() as OrderReceipt;
      if (
        order.orderId.toLowerCase() === term ||
        order.customerEmail.toLowerCase().includes(term)
      ) {
        matches.push(order);
      }
    });

    return matches;
  } catch (err) {
    console.error('Error looking up order:', err);
    return [];
  }
}

/**
 * Reset / Re-seed store database with default 24 products
 */
export async function resetDatabaseToDefaults(): Promise<void> {
  const batch = writeBatch(db);
  PRODUCTS.forEach((prod) => {
    const prodDoc = doc(db, PRODUCTS_COLLECTION, String(prod.id));
    batch.set(prodDoc, prod);
  });
  await batch.commit();
}

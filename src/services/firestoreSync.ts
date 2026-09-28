import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { AppStateData } from './storage';
import { saveData, loadInitialData } from './storage';

const CLUB_COLLECTION = 'clubs';
const CLUB_DOC_ID = 'akamsi_ledger_main';

/**
 * Fetch club data once from Cloud Firestore
 */
export const fetchClubDataFromFirestore = async (): Promise<AppStateData | null> => {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }

  try {
    const docRef = doc(db, CLUB_COLLECTION, CLUB_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const cloudData = snap.data() as AppStateData;
      // Cache latest cloud data locally
      saveData(cloudData);
      return cloudData;
    } else {
      // First time initialization: upload current local seed data to cloud
      const initialLocal = loadInitialData();
      await setDoc(docRef, {
        ...initialLocal,
        updated_at: new Date().toISOString()
      });
      return initialLocal;
    }
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    return null;
  }
};

/**
 * Save club data to Cloud Firestore and sync locally
 */
export const saveClubDataToFirestore = async (data: AppStateData): Promise<void> => {
  // Always save locally first for instant UI response and offline support
  saveData(data);

  if (!isFirebaseConfigured() || !db) {
    return;
  }

  try {
    const docRef = doc(db, CLUB_COLLECTION, CLUB_DOC_ID);
    await setDoc(docRef, {
      ...data,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving data to Firestore:', error);
  }
};

/**
 * Real-time listener: Listen to live changes from Cloud Firestore across all devices
 */
export const subscribeToClubData = (
  onDataChanged: (data: AppStateData) => void
): (() => void) => {
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const docRef = doc(db, CLUB_COLLECTION, CLUB_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as AppStateData;
          saveData(cloudData);
          onDataChanged(cloudData);
        }
      },
      (error) => {
        console.warn('Realtime Firestore subscription error:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Failed to setup Firestore realtime listener:', error);
    return () => {};
  }
};

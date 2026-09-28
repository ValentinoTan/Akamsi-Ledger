import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { AppStateData } from './storage';
import { saveData, loadInitialData, DEFAULT_TRANSACTIONS } from './storage';

const CLUB_COLLECTION = 'clubs';
const CLUB_DOC_ID = 'akamsi_ledger_main';

let lastSyncedHash = '';

const getContentHash = (data: AppStateData): string => {
  return JSON.stringify({
    p: data.players,
    s: data.sessions,
    a: data.attendees,
    t: data.transactions,
    c: data.clubName,
  });
};

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
      const rawData = snap.data();
      const cloudData: AppStateData = {
        players: rawData.players || [],
        sessions: rawData.sessions || [],
        attendees: rawData.attendees || [],
        transactions: rawData.transactions || [],
        clubName: rawData.clubName || 'Akamsi Badminton Club',
      };

      // If Firestore has old demo PB Smash Nusantara data, replace with real Akamsi data
      if (cloudData.clubName === 'PB Smash Nusantara') {
        const realData = loadInitialData();
        await saveClubDataToFirestore(realData);
        return realData;
      }

      if (cloudData.transactions.length === 0 && DEFAULT_TRANSACTIONS.length > 0) {
        cloudData.transactions = DEFAULT_TRANSACTIONS;
        lastSyncedHash = getContentHash(cloudData);
        saveData(cloudData);
        await saveClubDataToFirestore(cloudData);
        return cloudData;
      }

      lastSyncedHash = getContentHash(cloudData);
      saveData(cloudData);
      return cloudData;
    } else {
      // First time initialization: upload current local seed data to cloud
      const initialLocal = loadInitialData();
      lastSyncedHash = getContentHash(initialLocal);
      const sanitizedInitial = JSON.parse(
        JSON.stringify({
          ...initialLocal,
          updated_at: new Date().toISOString(),
        })
      );
      await setDoc(docRef, sanitizedInitial);
      return initialLocal;
    }
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    return null;
  }
};

/**
 * Save club data to Cloud Firestore and sync locally (with duplicate write prevention)
 */
export const saveClubDataToFirestore = async (data: AppStateData): Promise<void> => {
  // Always save locally first for instant UI response and offline support
  saveData(data);

  if (!isFirebaseConfigured() || !db) {
    return;
  }

  const hash = getContentHash(data);
  // Avoid duplicate writes to save quota and prevent loops
  if (hash === lastSyncedHash) {
    return;
  }

  lastSyncedHash = hash;

  try {
    const docRef = doc(db, CLUB_COLLECTION, CLUB_DOC_ID);
    const sanitizedData = JSON.parse(
      JSON.stringify({
        players: data.players,
        sessions: data.sessions,
        attendees: data.attendees,
        transactions: data.transactions,
        clubName: data.clubName,
        updated_at: new Date().toISOString(),
      })
    );
    await setDoc(docRef, sanitizedData);
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
        // Ignore local pending writes initiated by this client
        if (snapshot.metadata.hasPendingWrites) {
          return;
        }

        if (snapshot.exists()) {
          const rawData = snapshot.data();
          const cloudData: AppStateData = {
            players: rawData.players || [],
            sessions: rawData.sessions || [],
            attendees: rawData.attendees || [],
            transactions: rawData.transactions || [],
            clubName: rawData.clubName || 'Akamsi Badminton Club',
          };

          if (cloudData.clubName === 'PB Smash Nusantara') {
            return;
          }

          const hash = getContentHash(cloudData);
          if (hash === lastSyncedHash) {
            return;
          }

          lastSyncedHash = hash;
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

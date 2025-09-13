import { useState, useEffect, useCallback } from 'react';
import { USSDSession } from '../components/USSDSimulator';

const DB_NAME = 'USSD_Simulator';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;

export function useIndexedDB() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize the database
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      setError(request.error);
      setIsLoading(false);
    };

    request.onsuccess = () => {
      setDb(request.result);
      setIsLoading(false);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Create indexes for querying
        store.createIndex('startTime', 'startTime', { unique: false });
      }
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // Helper function to wait for DB to be ready
  const waitForDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }

      // If still loading, wait a bit and try again
      if (isLoading) {
        const checkDB = () => {
          if (db) {
            resolve(db);
          } else if (!isLoading) {
            reject(new Error('Failed to initialize database'));
          } else {
            setTimeout(checkDB, 100);
          }
        };
        setTimeout(checkDB, 100);
      } else {
        reject(new Error('Database not initialized'));
      }
    });
  };

  // Save a session to IndexedDB
  const saveSession = useCallback(async (session: USSDSession): Promise<void> => {
    const db = await waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(session);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db, isLoading]);

  // Get all sessions from IndexedDB
  const getAllSessions = useCallback(async (): Promise<USSDSession[]> => {
    const db = await waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }, [db, isLoading]);

  // Get a single session by ID
  const getSession = useCallback(async (id: string): Promise<USSDSession | undefined> => {
    const db = await waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db, isLoading]);

  // Delete a session by ID
  const deleteSession = useCallback(async (id: string): Promise<void> => {
    const db = await waitForDB();
    return new Promise((resolve, reject) => {

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  return {
    db,
    isLoading,
    error,
    saveSession,
    getAllSessions,
    getSession,
    deleteSession,
  };
}

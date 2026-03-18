import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  DocumentReference,
  CollectionReference,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PerformanceMetric, GoogleAccount, OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const subscribeToMetrics = (uid: string, callback: (metrics: PerformanceMetric[]) => void) => {
  const path = 'metrics';
  const q = query(collection(db, path), where('uid', '==', uid));
  
  return onSnapshot(q, (snapshot) => {
    const metrics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PerformanceMetric));
    callback(metrics);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const subscribeToGoogleAccounts = (uid: string, callback: (accounts: GoogleAccount[]) => void) => {
  const path = 'google_accounts';
  const q = query(collection(db, path), where('uid', '==', uid));
  
  return onSnapshot(q, (snapshot) => {
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GoogleAccount));
    callback(accounts);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const addMetric = async (metric: Omit<PerformanceMetric, 'id' | 'updatedAt'>) => {
  const path = 'metrics';
  try {
    await addDoc(collection(db, path), {
      ...metric,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const addGoogleAccount = async (account: Omit<GoogleAccount, 'id' | 'lastSync'>) => {
  const path = 'google_accounts';
  try {
    await addDoc(collection(db, path), {
      ...account,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const deleteGoogleAccount = async (id: string) => {
  const path = `google_accounts/${id}`;
  try {
    await deleteDoc(doc(db, 'google_accounts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

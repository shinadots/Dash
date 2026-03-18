import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { PerformanceMetric, GoogleAccount, OperationType } from '../types';

// Função de erro simplificada (removida dependência de auth.currentUser)
function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString()
  };
  console.error('Firestore Error: ', errInfo);
}

// 1. Busca as Métricas (Removido filtro de UID para ser público)
export const subscribeToMetrics = (_uid: string, callback: (metrics: PerformanceMetric[]) => void) => {
  const path = 'metrics';
  
  // Agora buscamos todas as métricas da coleção, ordenadas por data
  const q = query(
    collection(db, path), 
    orderBy('date', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const metrics = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as PerformanceMetric));
    callback(metrics);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

// 2. Busca as Contas Google (Removido filtro de UID)
export const subscribeToGoogleAccounts = (_uid: string, callback: (accounts: GoogleAccount[]) => void) => {
  const path = 'google_accounts';
  const q = query(collection(db, path));
  
  return onSnapshot(q, (snapshot) => {
    const accounts = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as GoogleAccount));
    callback(accounts);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

// 3. Adicionar Métrica (Útil para testes manuais)
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

// 4. Adicionar Conta Google
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

// 5. Deletar Conta Google
export const deleteGoogleAccount = async (id: string) => {
  const path = `google_accounts/${id}`;
  try {
    await deleteDoc(doc(db, 'google_accounts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

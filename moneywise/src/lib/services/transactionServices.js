// src/lib/services/transactionService.js
import { db } from '$lib/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

/**
 * Add a transaction to Firestore under users/{uid}/transactions
 * Returns the new document id.
 * txn may include: amount, type, date (ISO string or Date or Timestamp), category, notes
 */
export async function addTransaction(uid, txn) {
  const colRef = collection(db, 'users', uid, 'transactions');

  const toSave = { ...txn, createdAt: serverTimestamp() };

  // normalize date -> Firestore Timestamp (if provided)
  if (txn?.date) {
    try {
      if (typeof txn.date === 'string' || txn.date instanceof String) {
        toSave.date = Timestamp.fromDate(new Date(txn.date));
      } else if (txn.date instanceof Date) {
        toSave.date = Timestamp.fromDate(txn.date);
      } else {
        // assume it's already a Timestamp or compatible
        toSave.date = txn.date;
      }
    } catch (e) {
      // fallback: don't block save — keep original value
      console.warn('Could not convert txn.date to Timestamp:', e);
    }
  }

  const docRef = await addDoc(colRef, toSave);
  return docRef.id;
}

/**
 * Update an existing transaction document
 */
export async function updateTransaction(uid, id, updates) {
  const ref = doc(db, 'users', uid, 'transactions', id);
  const upd = { ...updates };

  if (updates?.date) {
    try {
      if (typeof updates.date === 'string' || updates.date instanceof String) {
        upd.date = Timestamp.fromDate(new Date(updates.date));
      } else if (updates.date instanceof Date) {
        upd.date = Timestamp.fromDate(updates.date);
      } else {
        upd.date = updates.date;
      }
    } catch (e) {
      console.warn('Could not convert updates.date to Timestamp:', e);
    }
  }

  await updateDoc(ref, upd);
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(uid, id) {
  const ref = doc(db, 'users', uid, 'transactions', id);
  await deleteDoc(ref);
}

/**
 * Subscribe to transactions for a user.
 * onUpdate receives an array of { id, ...data }.
 * Returns the unsubscribe function from onSnapshot.
 */
export function subscribeTransactions(uid, onUpdate) {
  const colRef = collection(db, 'users', uid, 'transactions');

  // Query: try to order by 'date' descending. If you prefer createdAt, change to orderBy('createdAt', 'desc')
  const q = query(colRef, orderBy('date', 'desc'));

  const unsub = onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data };
      });

      // Defensive sort: convert Timestamp to millis and sort newest-first
      list.sort((a, b) => {
        const aTime = a?.date?.toMillis ? a.date.toMillis() : a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b?.date?.toMillis ? b.date.toMillis() : b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });

      onUpdate(list);
    },
    (err) => {
      console.error('subscribeTransactions snapshot error:', err);
      onUpdate([]);
    }
  );

  return unsub;
}

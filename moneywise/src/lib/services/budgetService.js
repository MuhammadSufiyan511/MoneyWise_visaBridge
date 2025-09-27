// src/lib/services/budgetService.js  (Firestore version)
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
 * Add a budget under users/{uid}/budgets
 * budget: { category, limit (number), periodStart (ISO/date/string), periodEnd (ISO/date/string) }
 */
export async function addBudget(uid, budget) {
  if (!uid) throw new Error('uid required');
  const colRef = collection(db, 'users', uid, 'budgets');

  const toSave = { ...budget, createdAt: serverTimestamp() };

  // Normalize periodStart / periodEnd to Timestamps if provided
  if (budget?.periodStart) {
    try {
      toSave.periodStart =
        budget.periodStart instanceof Date
          ? Timestamp.fromDate(budget.periodStart)
          : Timestamp.fromDate(new Date(budget.periodStart));
    } catch (e) {
      console.warn('addBudget: could not parse periodStart', e);
    }
  }
  if (budget?.periodEnd) {
    try {
      toSave.periodEnd =
        budget.periodEnd instanceof Date
          ? Timestamp.fromDate(budget.periodEnd)
          : Timestamp.fromDate(new Date(budget.periodEnd));
    } catch (e) {
      console.warn('addBudget: could not parse periodEnd', e);
    }
  }

  const docRef = await addDoc(colRef, toSave);
  return docRef.id;
}

/**
 * Update a budget
 */
export async function updateBudget(uid, id, updates) {
  if (!uid || !id) throw new Error('uid and id required');
  const ref = doc(db, 'users', uid, 'budgets', id);

  const upd = { ...updates };

  if (updates?.periodStart) {
    try {
      upd.periodStart =
        updates.periodStart instanceof Date
          ? Timestamp.fromDate(updates.periodStart)
          : Timestamp.fromDate(new Date(updates.periodStart));
    } catch (e) {
      console.warn('updateBudget: could not parse periodStart', e);
    }
  }
  if (updates?.periodEnd) {
    try {
      upd.periodEnd =
        updates.periodEnd instanceof Date
          ? Timestamp.fromDate(updates.periodEnd)
          : Timestamp.fromDate(new Date(updates.periodEnd));
    } catch (e) {
      console.warn('updateBudget: could not parse periodEnd', e);
    }
  }

  await updateDoc(ref, upd);
}

/**
 * Delete a budget
 */
export async function deleteBudget(uid, id) {
  if (!uid || !id) throw new Error('uid and id required');
  const ref = doc(db, 'users', uid, 'budgets', id);
  await deleteDoc(ref);
}

/**
 * Subscribe to budgets for a user.
 * onUpdate receives an array of { id, ...data } where periodStart/periodEnd may be Firestore Timestamps.
 * Returns unsubscribe function.
 */
export function subscribeBudgets(uid, onUpdate) {
  if (!uid) return () => {};
  const colRef = collection(db, 'users', uid, 'budgets');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  const unsub = onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data };
      });

      onUpdate(list);
    },
    (err) => {
      console.error('[budgetService] onSnapshot error', err);
      onUpdate([]);
    }
  );

  return unsub;
}

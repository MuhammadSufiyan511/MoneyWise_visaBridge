// src/lib/stores/transactions.js
import { writable } from 'svelte/store';
import * as txService from '../services/transactionServices'; // make sure this path matches your service file

export const transactions = writable([]);
let _unsubscribe = null;

/** Helper: convert Firestore Timestamp or Date to YYYY-MM-DD string */
function toDateString(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'number') {
    return new Date(value).toISOString().slice(0, 10);
  }
  // fallback try
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

/** Normalize single tx doc data for UI */
function normalizeTx(doc) {
  // doc is expected to contain id and fields including date and createdAt (maybe Firestore Timestamps)
  const { id, date, createdAt, amount, ...rest } = doc;
  const dateString = toDateString(date);
  const dateMillis = date && typeof date.toMillis === 'function' ? date.toMillis()
                    : date instanceof Date ? date.getTime()
                    : typeof date === 'number' ? date
                    : (date ? new Date(date).getTime() : null);

  const createdAtMillis = createdAt && typeof createdAt.toMillis === 'function' ? createdAt.toMillis()
                          : createdAt instanceof Date ? createdAt.getTime()
                          : typeof createdAt === 'number' ? createdAt
                          : (createdAt ? new Date(createdAt).getTime() : null);

  return {
    id,
    amount: typeof amount === 'string' ? Number(amount) : amount,
    date,
    dateString,
    dateMillis,
    createdAt,
    createdAtMillis,
    ...rest
  };
}

/**
 * Start listening for transactions for uid (real-time).
 * Replaces previous listener if called again.
 */
export function startTransactions(uid) {
  if (!uid) return;
  // cleanup existing
  if (typeof _unsubscribe === 'function') {
    _unsubscribe();
  }

  _unsubscribe = txService.subscribeTransactions(uid, (list) => {
    // normalize each item
    const normalized = (list || []).map(normalizeTx);
    transactions.set(normalized);
  });
}

/** Stop listening and clear store */
export function stopTransactions() {
  if (typeof _unsubscribe === 'function') {
    _unsubscribe();
  }
  _unsubscribe = null;
  transactions.set([]);
}

/** CRUD wrappers that forward to service layer */
export async function addTransaction(uid, txn) {
  // txn can include date as ISO string or Date; service will convert to Timestamp
  return await txService.addTransaction(uid, txn);
}

export async function editTransaction(uid, id, updates) {
  return await txService.updateTransaction(uid, id, updates);
}

export async function removeTransaction(uid, id) {
  return await txService.deleteTransaction(uid, id);
}

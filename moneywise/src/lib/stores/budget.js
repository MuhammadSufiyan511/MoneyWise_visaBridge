// src/lib/stores/budget.js
import { writable } from 'svelte/store';
import * as budgetService from '$lib/services/budgetService';

/**
 * budgets store — array of budget objects
 * Each budget object will include:
 *  - id
 *  - category, limit, createdAt (Firestore Timestamp)
 *  - periodStart, periodEnd (Firestore Timestamp OR string)
 *  - periodStartString, periodEndString (YYYY-MM-DD) => handy for UI
 */
export const budgets = writable([]);
let _unsubscribe = null;

function toDateString(value) {
  if (!value) return '';
  // Firestore Timestamp
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString().slice(0, 10);
  }
  // already string or Date
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  // fallback
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function normalizeBudget(b) {
  // keep original fields, but add friendly string dates
  return {
    ...b,
    periodStartString: toDateString(b.periodStart),
    periodEndString: toDateString(b.periodEnd)
  };
}

/**
 * Start listening for budgets in realtime for the given uid.
 * If called multiple times it will clean the previous listener.
 */
export function startBudgets(uid) {
  if (!uid) return;
  // remove any existing listener
  if (typeof _unsubscribe === 'function') {
    _unsubscribe();
  }
  _unsubscribe = budgetService.subscribeBudgets(uid, (list) => {
    // normalize firestore Timestamps to friendly strings for UI
    const normalized = (list || []).map(normalizeBudget);
    budgets.set(normalized);
  });
}

/**
 * Stop listening and clear budgets
 */
export function stopBudgets() {
  if (typeof _unsubscribe === 'function') {
    _unsubscribe();
  }
  _unsubscribe = null;
  budgets.set([]);
}

/**
 * Add a budget (returns the generated id)
 * budget shape expected:
 * { category: 'Groceries', limit: 400, periodStart: '2025-09-01', periodEnd: '2025-09-30' }
 */
export async function addBudget(uid, budget) {
  return await budgetService.addBudget(uid, budget);
}

/**
 * Edit a budget by id
 */
export async function editBudget(uid, id, updates) {
  return await budgetService.updateBudget(uid, id, updates);
}

/**
 * Remove a budget by id
 */
export async function removeBudget(uid, id) {
  return await budgetService.deleteBudget(uid, id);
}

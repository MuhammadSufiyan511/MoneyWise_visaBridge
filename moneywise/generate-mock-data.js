/**
 * generate-mock-data.js
 * Generates data.json with mock users, transactions and budgets.
 *
 * Usage:
 *   node generate-mock-data.js
 *
 * Output:
 *   ./data.json
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// reconstruct __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUT = join(__dirname, "data.json");

// configuration
const NUM_USERS = 2; 
const TX_PER_USER = 100;
const START_DATE = new Date('2025-01-01'); 
const END_DATE = new Date('2025-09-20');   
const BUDGET_CATEGORIES = [
  { category: 'Food', limit: 10000 },
  { category: 'Rent', limit: 30000 },
  { category: 'Entertainment', limit: 5000 }
];

// helper: random integer between min..max
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// helper: pick random element
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// helper: random date between START_DATE and END_DATE
function randomDate() {
  const s = START_DATE.getTime();
  const e = END_DATE.getTime();
  return new Date(rnd(s, e));
}

// format date to YYYY-MM-DD
function isoDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// create users
const users = [];
for (let u = 1; u <= NUM_USERS; u++) {
  const uid = `mock_user_${u}`;
  const name = u === 1 ? 'Muhammad Sufiyan' : `User ${u}`;
  const email = u === 1 ? 'sufiyan@example.com' : `user${u}@example.com`;

  // transactions: generate TX_PER_USER items
  const txs = [];
  // ensure a few monthly incomes: generate one income per month
  const months = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09'];
  let txnIdCounter = 1;
  // add monthly incomes first
  months.forEach((m) => {
    const [yy, mm] = m.split('-').map(Number);
    const day = rnd(1, 28);
    const dt = new Date(Date.UTC(yy, mm - 1, day));
    txs.push({
      id: `txn_${uid}_${String(txnIdCounter++).padStart(4,'0')}`,
      amount: rnd(90000, 200000) / 100, // salary ~ 900 - 2000 (use currency units)
      type: 'income',
      date: isoDate(dt),
      category: 'Salary',
      notes: 'Monthly salary',
      createdAt: new Date(dt.getTime() + 1000).toISOString()
    });
  });

  // remaining transactions as random expenses/incomes
  const categories = ['Food', 'Transport', 'Groceries', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'];
  while (txs.length < TX_PER_USER) {
    const d = randomDate();
    const isIncome = Math.random() < 0.12; // 12% chance of additional income
    const category = isIncome ? 'Other Income' : pick(categories);
    const amount = isIncome ? rnd(5000, 50000) / 100 : rnd(50, 5000) / 100; // income bigger, expenses smaller
    txs.push({
      id: `txn_${uid}_${String(txnIdCounter++).padStart(4,'0')}`,
      amount: Number(amount.toFixed(2)),
      type: isIncome ? 'income' : 'expense',
      date: isoDate(d),
      category,
      notes: isIncome ? 'Extra income' : `Spent on ${category}`,
      createdAt: new Date(d.getTime() + rnd(1000, 1000000)).toISOString()
    });
  }

  // sort transactions by date ascending (optionally)
  txs.sort((a,b) => new Date(a.date) - new Date(b.date));

  // budgets - use the 3 defined categories with period = current month range
  const budgets = BUDGET_CATEGORIES.map((b, idx) => {
    // choose a recent month for each budget (use same month for simplicity)
    const periodStart = '2025-09-01';
    const periodEnd = '2025-09-30';
    return {
      id: `bud_${uid}_${idx+1}`,
      category: b.category,
      limit: b.limit,
      periodStart,
      periodEnd,
      createdAt: new Date().toISOString()
    };
  });

  users.push({
    id: uid,
    profile: {
      name,
      email,
      currency: 'PKR',
      createdAt: new Date().toISOString()
    },
    accounts: [
      {
        id: `acc_${uid}_wallet`,
        name: 'Wallet',
        type: 'cash',
        currency: 'PKR',
        balance: 1000.0,
        createdAt: new Date().toISOString()
      }
    ],
    transactions: txs,
    budgets
  });
}

// write file
const out = { users };
writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
console.log(`Generated ${OUT} with ${users.length} users, each with ${TX_PER_USER} transactions.`);

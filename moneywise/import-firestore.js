// import-firestore.js
import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCqPcikw211ClgJitlXn_-d7EOc8mIIBeY",
  authDomain: "moneywise-cd164.firebaseapp.com",
  projectId: "moneywise-cd164",
  storageBucket: "moneywise-cd164.appspot.com",
  messagingSenderId: "607625937692",
  appId: "1:607625937692:web:1c343cbc9194d9be96f0d9",
  measurementId: "G-FNYVGYCT6K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Load mock data
const raw = readFileSync("data.json", "utf8");
const data = JSON.parse(raw);

async function importData() {
  try {
    for (const user of data.users) {
      const uid = user.uid;
      if (!uid) {
        console.warn("⚠️ Skipping user without uid", user);
        continue;
      }

      // --- Budgets ---
      for (const b of user.budgets) {
        const ref = doc(db, "budgets", uid, "items", b.id || b.category);
        await setDoc(ref, { ...b, uid });
      }

      // --- Transactions ---
      for (const t of user.transactions) {
        const ref = doc(db, "users", uid, "transactions", t.id);
        await setDoc(ref, { ...t, uid });
      }
    }

    console.log("✅ Import completed!");
  } catch (err) {
    console.error("❌ Import failed:", err);
  }
}

importData();

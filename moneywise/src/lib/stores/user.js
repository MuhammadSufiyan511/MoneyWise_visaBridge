// src/lib/stores/user.js
import { writable } from 'svelte/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '$lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

/**
 * user store holds a merged object:
 * {
 *   uid,
 *   email,
 *   displayName,
 *   // + any fields stored in Firestore users/{uid} (name, currency, etc.)
 * }
 */
export const user = writable(null);

let _unsubProfile = null;

// helper to stop profile listener
function stopProfileListener() {
  if (typeof _unsubProfile === 'function') {
    _unsubProfile();
    _unsubProfile = null;
  }
}

// watch Firebase Auth changes
onAuthStateChanged(auth, (authUser) => {
  // remove any previous profile listener
  stopProfileListener();

  if (!authUser) {
    // signed out
    user.set(null);
    return;
  }

  // basic auth info we always have
  const basic = {
    uid: authUser.uid,
    email: authUser.email,
    displayName: authUser.displayName || null
  };

  // set basic first so UI can render immediately
  user.set(basic);

  // subscribe to Firestore profile document: users/{uid}
  const profileRef = doc(db, 'users', authUser.uid);

  _unsubProfile = onSnapshot(
    profileRef,
    (snap) => {
      if (snap.exists()) {
        const profileData = snap.data();
        // Merge Firestore profile fields with basic auth info
        user.set({
          ...basic,
          ...profileData
        });
      } else {
        // No profile doc yet — keep basic auth info
        user.set(basic);
      }
    },
    (err) => {
      console.error('user profile onSnapshot error:', err);
      // fallback to basic
      user.set(basic);
    }
  );
});

/**
 * Optional helper to clear the user store and stop listeners.
 * Useful for tests or manual cleanup.
 */
export function clearUser() {
  stopProfileListener();
  user.set(null);
}

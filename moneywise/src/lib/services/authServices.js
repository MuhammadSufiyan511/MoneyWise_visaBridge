// src/lib/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '$lib/firebase';
import { db } from '$lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { goto } from '$app/navigation';
import { user } from '$lib/stores/user'; // correct path to your user store

export async function signUp(email, password, displayName) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // update auth profile displayName
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    // create / merge user profile document in Firestore
    const profile = {
      name: displayName || cred.user.displayName || '',
      email: cred.user.email,
      currency: 'USD', // default, change if needed
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true });

    // return the firebase user object
    return cred.user;
  } catch (err) {
    console.error('signUp error', err);
    throw err; // rethrow so caller (UI) can show messages
  }
}

export async function signIn(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (err) {
    console.error('signIn error', err);
    throw err;
  }
}

export async function logout() {
  try {
    await signOut(auth);
    // clear local user store
    user.set(null);
    // redirect to home or login
    goto('/');
  } catch (err) {
    console.error('Logout failed:', err);
    throw err;
  }
}

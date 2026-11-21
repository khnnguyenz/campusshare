
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
  increment,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyAlWrG1JGHCV7L7uwDhG1jphlMYY4kj8BE",
  authDomain: "campusshare-63746.firebaseapp.com",
  projectId: "campusshare-63746",
  storageBucket: "campusshare-63746.firebasestorage.app",
  messagingSenderId: "845200216867",
  appId: "1:845200216867:web:5d4239b9cb6b3e6fa27296",
  measurementId: "G-08LB0K0QF7"
};

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  window.CS = {
    app,
    auth,
    db,
    storage,

    authApi: {
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
      sendPasswordResetEmail,
      updateProfile,
      setPersistence,
      browserLocalPersistence,
      browserSessionPersistence
    },

    dbApi: {
      collection,
      doc,
      getDoc,
      getDocs,
      setDoc,
      addDoc,
      updateDoc,
      deleteDoc,
      query,
      where,
      orderBy,
      limit,
      onSnapshot,
      serverTimestamp,
      writeBatch,
      runTransaction,
      increment,
      arrayUnion,
      arrayRemove
    },

    storageApi: {
      ref,
      uploadBytes,
      getDownloadURL,
      deleteObject
    }
  };

  console.log("CampusShare: Firebase đã kết nối!");

  window.dispatchEvent(new Event("cs-firebase-ready"));

} catch (error) {
  console.error("CampusShare Firebase error:", error);

  window.dispatchEvent(
    new CustomEvent("cs-firebase-error", {
      detail: error
    })
  );
}

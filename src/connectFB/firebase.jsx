import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWLtX-s59ccP4SZmpbXDCn3aEcWBnHtow",
  authDomain: "chatapp-a3057.firebaseapp.com",
  projectId: "chatapp-a3057",
  storageBucket: "chatapp-a3057.appspot.com",
  messagingSenderId: "748323116845",
  appId: "1:748323116845:web:3674f03bd993c93755a5a4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFQYudvB_pV_OBywebPySY5NwPrF7N9UI",
  authDomain: "blue-tick-todo.firebaseapp.com",
  projectId: "blue-tick-todo",
  storageBucket: "blue-tick-todo.firebasestorage.app",
  messagingSenderId: "985184847587",
  appId: "1:985184847587:web:57b72e8294492f0ca69866",
  measurementId: "G-YRZSL8FGX9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
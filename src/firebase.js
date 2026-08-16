import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEKCLop5_uK3sG9H794K6QSEHATJ2nWZQ",
  authDomain: "studyfox-student-tracker.firebaseapp.com",
  projectId: "studyfox-student-tracker",
  storageBucket: "studyfox-student-tracker.firebasestorage.app",
  messagingSenderId: "450827450490",
  appId: "1:450827450490:web:da30b5115e94a2d3a523c3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
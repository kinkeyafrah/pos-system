
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXEEg98gXBplCMljnsG-yO71lo0xTeckM",
  authDomain: "retailsom-f20c8.firebaseapp.com",
  projectId: "retailsom-f20c8",
  storageBucket: "retailsom-f20c8.firebasestorage.app",
  messagingSenderId: "811518244252",
  appId: "1:811518244252:web:3350dbc0b4eb6ce21a4459"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

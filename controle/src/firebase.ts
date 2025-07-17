// ...adicione este arquivo novo...
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhI_JbjN8pvceTTHilwQcSGS6Eh1KelSA",
  authDomain: "controleepi-52428.firebaseapp.com",
  projectId: "controleepi-52428",
  storageBucket: "controleepi-52428.firebasestorage.app",
  messagingSenderId: "536537158385",
  appId: "1:536537158385:web:2aca1bcbc56713613c4f50"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);

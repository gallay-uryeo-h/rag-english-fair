import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCnH8_NnbMizdrmMQJuBaDl-kEO13DrzC8",
  authDomain: "family2-8bcd8.firebaseapp.com",
  projectId: "family2-8bcd8",
  storageBucket: "family2-8bcd8.firebasestorage.app",
  messagingSenderId: "1081493491692",
  appId: "1:1081493491692:web:774f10b1267e15bbcafac9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 이 앱 전용 Firestore 최상위 컬렉션명 (다른 앱과 공유되는 프로젝트이므로 단일 컬렉션으로 격리)
export const COLLECTION = 'rag-english-fair';

/**
 * Configuración de Firebase para Jeopardy Live Show.
 * Puedes actualizar directamente estos valores con los de tu nuevo proyecto de Firebase,
 * o definirlos mediante variables de entorno VITE_FIREBASE_*.
 */

export interface FirebaseProjectConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
}

export const firebaseConfig: FirebaseProjectConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCaWffSlgpxC0dHTJWx7sdd2jHjvcf7drQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apps-educativas-suscripciones.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apps-educativas-suscripciones",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apps-educativas-suscripciones.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "266465203983",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:266465203983:web:83ba940bc2d180898b507a",
  // Si tu nuevo proyecto de Firebase Realtime Database requiere URL explícita (ej. en us-central1 o firebasedatabase.app):
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://apps-educativas-suscripciones-default-rtdb.firebaseio.com"
};

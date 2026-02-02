// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEDLruVsBxRuS0eRe4cTR7TPYifxkV8GU",
  authDomain: "molldini-f4e7a.firebaseapp.com",
  projectId: "molldini-f4e7a",
  storageBucket: "molldini-f4e7a.firebasestorage.app",
  messagingSenderId: "668795946761",
  appId: "1:668795946761:web:77d3e6e4ad547fdd85b5d8",
  measurementId: "G-LBKQXL9WKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

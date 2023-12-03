// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase-auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAW6k30vUfN0P6u8TN7Y5dtwFbuWz5aZPg",
  authDomain: "chat-app-web-socket.firebaseapp.com",
  projectId: "chat-app-web-socket",
  storageBucket: "chat-app-web-socket.appspot.com",
  messagingSenderId: "607044813536",
  appId: "1:607044813536:web:47683f28a38df08f680685"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export {app, auth};
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.firebasestorage.app",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};
const auth = getAuth();
   const app = initializeApp(firebaseConfig);
   // Функция за промяна на заглавието
   export function setTitleForPage(pageTitle) {
       document.addEventListener("DOMContentLoaded", () => {
           const auth = getAuth();
   
           // Изчаква Firebase да провери логнатия потребител
           onAuthStateChanged(auth, (user) => {
               if (user) {
                   const userName = user.displayName || user.email || "Гост";
                   document.title = `${pageTitle} | ${userName}`;
               } else {
                   document.title = `${pageTitle} | Гост`;
               }
           });
       });
   }
   
